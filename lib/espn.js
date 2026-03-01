// lib/espn.js  – all fetching happens server-side (no CORS problems)

const BASE = "https://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball";
const WEB  = "https://site.web.api.espn.com/apis/site/v2/sports/baseball/college-baseball";

// Power 4 conference group IDs in ESPN's system
export const POWER4 = { SEC: "8", ACC: "1", "Big 12": "4", "Big Ten": "5" };

export async function fetchScoreboard() {
  const groups = Object.values(POWER4).join(",");
  const url = `${BASE}/scoreboard?limit=300&groups=${groups}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`ESPN scoreboard error: ${res.status}`);
  return res.json();
}

export async function fetchGameSummary(eventId) {
  const url = `${WEB}/summary?region=us&lang=en&contentorigin=espn&event=${eventId}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`ESPN summary error: ${res.status}`);
  return res.json();
}

// ── Parsers ──────────────────────────────────────────────────────────────────

export function parseScoreboard(data) {
  if (!data?.events) return [];

  // Build a map of group/conf IDs → names from the leagues block
  const confMap = {};
  data.leagues?.[0]?.groups?.forEach((g) => {
    confMap[String(g.groupId)] = g.name;
  });

  return data.events.map((ev) => {
    const comp   = ev.competitions?.[0];
    const away   = comp?.competitors?.find((c) => c.homeAway === "away");
    const home   = comp?.competitors?.find((c) => c.homeAway === "home");
    const status = parseStatus(ev);

    // Inning-by-inning linescores
    const ls       = comp?.linescores || [];
    const awayInn  = ls.filter((_, i) => i % 2 === 0).map((l) => l.value ?? null);
    const homeInn  = ls.filter((_, i) => i % 2 !== 0).map((l) => l.value ?? null);
    const innings  = Array.from({ length: Math.max(9, awayInn.length) }, (_, i) => ({
      away: awayInn[i] ?? null,
      home: homeInn[i] ?? null,
    }));

    const sit = comp?.situation || {};

    // Resolve conference name
    const confId   = String(comp?.conferenceId || comp?.groups?.[0]?.id || "");
    const confName = confMap[confId] || comp?.conferenceCompetition?.name || "";

    // Map to friendly Power4 tab label
    const tabLabel = Object.entries(POWER4).find(([, id]) => id === confId)?.[0] || "";

    return {
      id:         ev.id,
      conference: tabLabel,
      confName:   confName,
      away:       parseTeam(away),
      home:       parseTeam(home),
      status,
      innings,
      inning:     comp?.status?.period || 1,
      isTop:      sit.isTopHalf ?? true,
      outs:       sit.outs       ?? 0,
      balls:      sit.balls      ?? 0,
      strikes:    sit.strikes    ?? 0,
      onFirst:    !!sit.onFirst,
      onSecond:   !!sit.onSecond,
      onThird:    !!sit.onThird,
      venue:      comp?.venue?.fullName || "",
      date:       ev.date,
    };
  });
}

function parseTeam(side) {
  if (!side) return {};
  return {
    id:        side.team?.id,
    name:      side.team?.displayName || side.team?.name || "",
    shortName: side.team?.shortDisplayName || side.team?.abbreviation || "",
    abbr:      side.team?.abbreviation || "",
    logo:      side.team?.logo || "",
    score:     parseInt(side.score ?? 0),
    hits:      side.hits   ?? "–",
    errors:    side.errors ?? "–",
    record:    side.records?.[0]?.summary || "",
    rank:      side.curatedRank?.current || null,
  };
}

function parseStatus(ev) {
  const state  = ev?.status?.type?.state;
  const detail = ev?.status?.type?.shortDetail || "";
  if (state === "in")   return { type: "LIVE",      label: detail };
  if (state === "post") return { type: "FINAL",     label: "FINAL" };
  return                       { type: "SCHEDULED", label: detail };
}

export function parseGameSummary(data) {
  if (!data) return { batters: {}, pitchers: {} };

  const result = { away: { batters: [], pitchers: [] }, home: { batters: [], pitchers: [] } };

  data.boxscore?.players?.forEach((side) => {
    const key = side.homeAway === "away" ? "away" : "home";
    side.statistics?.forEach((stat) => {
      const rows = (stat.athletes || []).map((a) => ({
        name:   a.athlete?.displayName || a.athlete?.shortName || "—",
        pos:    a.athlete?.position?.abbreviation || "",
        stats:  a.stats || [],
        labels: stat.labels || [],
      }));
      if (stat.name === "batting")  result[key].batters  = rows;
      if (stat.name === "pitching") result[key].pitchers = rows;
    });
  });

  return result;
}
