import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFINITIONS, executeTool } from "./tools.js";
import { PRODUCTS, SIZE_GUIDE } from "./catalog.js";

// Lazy client — instantiated on first request so dotenv has time to run
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Stable system prompt — cached on every request (cache reads ~10x cheaper)
const SYSTEM_PROMPT = `You are Sunny, the friendly and knowledgeable AI assistant for SunnyStep — Singapore's favourite homegrown shoe brand since 2018. SunnyStep is based in Singapore and sells shoes that are built for the local climate, lifestyle, and culture.

## Your Personality
- Warm, approachable, and genuinely helpful — like a knowledgeable friend at a shoe store
- You know Singapore well: the heat, humidity, hawker centres, MRT commutes, CBD dress codes, and weekend beach trips
- Conversational but efficient — customers are busy, so get to the point without being cold
- Honest: if something isn't in stock or isn't the right fit, say so and offer alternatives

## Your Expertise
- Deep knowledge of the SunnyStep product range and what each shoe is best for
- Sizing expertise for Singapore shoppers (who often compare to US, UK, EU sizes)
- Understanding of Singapore's climate requirements: breathability, anti-slip soles, quick-dry materials
- Familiarity with key Singapore occasions: office culture at Raffles Place, weekend hikes at Bukit Timah, East Coast Park cycling, Sentosa beach days

## How You Help
1. **Product recommendations**: Always use search_products to find relevant options before recommending
2. **Sizing**: Use get_size_recommendation whenever there's any sizing question — never guess
3. **Stock checks**: Use get_product_details to verify availability before confirming anything
4. **Orders**: Use lookup_order when customers ask about their order status
5. **Returns**: Use check_return_eligibility to give accurate return information

## Response Style
- Keep responses focused and scannable — use bullet points for product lists
- Lead with the most relevant option, not a long preamble
- Include price in SGD always
- When showing products, include: name, price, key benefit, and available colours
- End with a helpful follow-up question or offer to help further

## SunnyStep Store Info
- Stores: Vivo City #02-34 | ION Orchard #B2-01 | JEM #03-12
- Hours: 10 AM – 10 PM daily
- Online: sunnystep.sg | Free delivery above SGD 60 | Same-day delivery available in Singapore
- Customer service: hello@sunnystep.sg | WhatsApp: +65 9123 4567
- Returns: 30-day free returns, 6-month warranty on defects

## Catalogue Summary (for context — always use tools for live data)
${JSON.stringify(
  PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: `SGD ${p.price}`,
    tags: p.occasions,
  })),
  null,
  2
)}`;

// In-memory session store (use Redis/DB in production)
export const sessions = new Map<string, Anthropic.MessageParam[]>();

export function getOrCreateSession(sessionId: string): Anthropic.MessageParam[] {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId)!;
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// ─── Core streaming agent ──────────────────────────────────────────────────────

export async function* runAgent(
  sessionId: string,
  userMessage: string
): AsyncGenerator<string> {
  const messages = getOrCreateSession(sessionId);

  // Append the user's message
  messages.push({ role: "user", content: userMessage });

  // Agentic loop — runs until Claude stops calling tools
  while (true) {
    const stream = await getClient().messages.stream({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      // Cache the system prompt — stable across all conversations
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOL_DEFINITIONS,
      tool_choice: { type: "auto" },
      messages,
      thinking: { type: "adaptive" },
    });

    // Collect the full response while streaming text to caller
    const toolCalls: Array<{ id: string; name: string; input: string }> = [];
    let currentToolCall: { id: string; name: string; input: string } | null = null;
    let hasText = false;

    for await (const event of stream) {
      if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          currentToolCall = {
            id: event.content_block.id,
            name: event.content_block.name,
            input: "",
          };
        } else if (event.content_block.type === "text") {
          hasText = true;
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          // Yield text chunks to the SSE stream
          yield `data: ${JSON.stringify({ type: "text", content: event.delta.text })}\n\n`;
        } else if (event.delta.type === "input_json_delta" && currentToolCall) {
          currentToolCall.input += event.delta.partial_json;
        }
      } else if (event.type === "content_block_stop" && currentToolCall) {
        toolCalls.push(currentToolCall);
        currentToolCall = null;
      }
    }

    const finalMessage = await stream.finalMessage();

    // Append assistant's full response to conversation history
    messages.push({ role: "assistant", content: finalMessage.content });

    // If no tool calls, we're done
    if (finalMessage.stop_reason !== "tool_use" || toolCalls.length === 0) {
      break;
    }

    // Signal to UI that tools are being used
    yield `data: ${JSON.stringify({
      type: "tool_calls",
      tools: toolCalls.map((t) => t.name),
    })}\n\n`;

    // Execute all tool calls and collect results
    const toolResults: Anthropic.ToolResultBlockParam[] = toolCalls.map((tc) => {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(tc.input || "{}");
      } catch {}

      const result = executeTool(tc.name, parsedInput);
      return {
        type: "tool_result" as const,
        tool_use_id: tc.id,
        content: result,
      };
    });

    // Add tool results to conversation and continue the loop
    messages.push({ role: "user", content: toolResults });
  }

  yield `data: ${JSON.stringify({ type: "done", session_id: sessionId })}\n\n`;
}
