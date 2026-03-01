// app/api/game/route.js
import { fetchGameSummary, parseGameSummary } from "../../lib/espn";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  try {
    const raw     = await fetchGameSummary(id);
    const summary = parseGameSummary(raw);
    // Also pass through the raw boxscore for inning data if needed
    return Response.json({ summary, updated: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
