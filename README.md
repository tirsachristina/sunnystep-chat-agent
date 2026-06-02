# SunnyStep AI Agent

Customer-facing AI assistant for SunnyStep, Singapore's homegrown shoe brand. Powered by Claude Opus 4.7 with tool use, prompt caching, and streaming SSE.

## Quick start

```bash
# 1. Set your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 2. Install and run
npm install
npm run dev

# Open http://localhost:3000
```

## What it does

**5 live tools Claude can call:**
- `search_products` — filter by category, occasion, price, features
- `get_product_details` — stock levels by colour + size
- `get_size_recommendation` — US/UK/EU → SunnyStep conversion + foot length
- `lookup_order` — real-time order status (demo data: SS10234, SS10198, SS10055)
- `check_return_eligibility` — 30-day policy + warranty

**Try these in the UI:**
- "I need breathable running shoes under SGD 200"
- "What size am I if I wear US 8 in Adidas?"
- "Track my order SS10234"
- "Kids shoes for a 7-year-old"
- "Can I return order SS10055?"

## Architecture

```
Claude Opus 4.7
  ├── System prompt (prompt-cached — ~10x cheaper after first request)
  ├── Tool use (agentic loop until stop_reason = end_turn)
  └── Streaming SSE → browser chat UI

Express server
  ├── POST /api/chat        — SSE stream
  ├── DELETE /api/sessions/:id
  └── GET /api/health
```

## Deploy to production

**Render (free tier works):**
1. Push to GitHub
2. New Web Service → connect repo
3. Build: `npm install && npm run build`
4. Start: `node dist/server.js`
5. Add `ANTHROPIC_API_KEY` as an environment variable

**Railway / Fly.io / any Node host** — same pattern.

## Extending it

- **Real product catalog** → swap `src/catalog.ts` with a DB/API call
- **Real orders** → replace `MOCK_ORDERS` in `catalog.ts` with your OMS
- **Persistent sessions** → replace the `Map` in `agent.ts` with Redis
- **Auth** → add JWT middleware in `server.ts`
- **Analytics** → log tool calls + session IDs to your analytics platform
