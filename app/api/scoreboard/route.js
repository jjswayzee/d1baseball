// app/api/scoreboard/route.js
import { fetchScoreboard, parseScoreboard } from "../../lib/espn";

export const revalidate = 30; // ISR – refresh every 30 seconds

export async function GET() {
  try {
    const raw   = await fetchScoreboard();
    const games = parseScoreboard(raw);
    return Response.json({ games, updated: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
