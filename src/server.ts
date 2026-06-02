import dotenv from "dotenv";
dotenv.config({ override: true }); // override any empty system-level env vars
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { runAgent, clearSession, sessions } from "./agent.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// ─── Chat endpoint (SSE streaming) ───────────────────────────────────────────

app.post("/api/chat", async (req, res) => {
  const { message, session_id } = req.body as {
    message?: string;
    session_id?: string;
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const sessionId = session_id ?? `session_${Date.now()}`;

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable Nginx buffering

  try {
    for await (const chunk of runAgent(sessionId, message)) {
      res.write(chunk);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.write(
      `data: ${JSON.stringify({ type: "error", message })}\n\n`
    );
    console.error("Agent error:", err);
  } finally {
    res.end();
  }
});

// ─── Session management ───────────────────────────────────────────────────────

app.delete("/api/sessions/:id", (req, res) => {
  clearSession(req.params.id);
  res.json({ cleared: true });
});

app.get("/api/sessions", (_req, res) => {
  res.json({
    active_sessions: sessions.size,
    session_ids: [...sessions.keys()],
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SunnyStep AI Agent",
    model: "claude-opus-4-7",
    timestamp: new Date().toISOString(),
  });
});

// ─── Serve the chat UI ────────────────────────────────────────────────────────

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n✓ SunnyStep Agent running at http://localhost:${PORT}`);
  console.log(`  Model: claude-opus-4-7 with prompt caching + streaming`);
  console.log(`  Tools: search_products, get_product_details, get_size_recommendation, lookup_order, check_return_eligibility\n`);
});
