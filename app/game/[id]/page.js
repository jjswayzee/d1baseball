"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Logo, Diamond, InningTable } from "../../components/ui";

function StatTable({ team, batters, pitchers, loading }) {
  const batLabels = batters[0]?.labels || ["AB","R","H","RBI","BB","SO","AVG"];
  const pitLabels = pitchers[0]?.labels || ["IP","H","R","ER","BB","SO","ERA"];

  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <Logo src={team?.logo} name={team?.name} size={34} />
        <div>
          <div style={{ fontWeight:800, fontSize:17, color:"#111", fontFamily:"'Oswald',sans-serif", letterSpacing:"0.03em" }}>{team?.name}</div>
          <div style={{ fontSize:10, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>{team?.record}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ color:"#ccc", fontFamily:"'Oswald',sans-serif", fontSize:13, padding:"12px 0" }}>Loading player stats…</div>
      ) : batters.length === 0 && pitchers.length === 0 ? (
        <div style={{ color:"#ccc", fontFamily:"'Oswald',sans-serif", fontSize:13, padding:"12px 0" }}>Player stats not yet available.</div>
      ) : (
        <>
          {batters.length > 0 && (
            <>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:"0.1em", fontFamily:"'Oswald',sans-serif", marginBottom:6 }}>BATTING</div>
              <div style={{ overflowX:"auto", marginBottom:18 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'Oswald',sans-serif", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                      <td style={{ paddingBottom:5, color:"#999", fontWeight:600, minWidth:160 }}>PLAYER</td>
                      <td style={{ paddingBottom:5, color:"#999", fontWeight:600, width:34 }}>POS</td>
                      {batLabels.map((l,i) => <td key={i} style={{ textAlign:"center", paddingBottom:5, color:"#999", fontWeight:600, width:42 }}>{l}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {batters.map((b,i) => (
                      <tr key={i} style={{ borderBottom:"1px solid #f8f8f8" }}>
                        <td style={{ paddingTop:7, paddingBottom:7, color:"#222", fontWeight:500 }}>{b.name}</td>
                        <td style={{ color:"#aaa", fontSize:10 }}>{b.pos}</td>
                        {b.stats.map((s,j) => <td key={j} style={{ textAlign:"center", paddingTop:7, paddingBottom:7, color:"#444" }}>{s}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {pitchers.length > 0 && (
            <>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:"0.1em", fontFamily:"'Oswald',sans-serif", marginBottom:6 }}>PITCHING</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'Oswald',sans-serif", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                      <td style={{ paddingBottom:5, color:"#999", fontWeight:600, minWidth:160 }}>PITCHER</td>
                      {pitLabels.map((l,i) => <td key={i} style={{ textAlign:"center", paddingBottom:5, color:"#999", fontWeight:600, width:46 }}>{l}</td>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pitchers.map((p,i) => (
                      <tr key={i} style={{ borderBottom:"1px solid #f8f8f8" }}>
                        <td style={{ paddingTop:7, paddingBottom:7, color:"#222", fontWeight:500 }}>{p.name}</td>
                        {p.stats.map((s,j) => <td key={j} style={{ textAlign:"center", paddingTop:7, paddingBottom:7, color:"#444" }}>{s}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params?.id;

  const [game, setGame]       = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load base game data from scoreboard
  const loadGame = useCallback(async () => {
    try {
      const res  = await fetch("/api/scoreboard");
      const data = await res.json();
      const found = (data.games || []).find((g) => g.id === gameId);
      if (found) setGame(found);
    } catch {}
  }, [gameId]);

  // Load detailed box score
  const loadSummary = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res  = await fetch(`/api/game?id=${gameId}`);
      const data = await res.json();
      setSummary(data.summary);
    } catch {}
    finally { setStatsLoading(false); }
  }, [gameId]);

  useEffect(() => {
    Promise.all([loadGame(), loadSummary()]).finally(() => setLoading(false));
    const t = setInterval(() => { loadGame(); loadSummary(); }, 30000);
    return () => clearInterval(t);
  }, [loadGame, loadSummary]);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#f4f5f7", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:36, height:36, border:"3px solid #f0f0f0", borderTop:"3px solid #C8102E", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
          <div style={{ color:"#bbb", fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:"0.08em" }}>LOADING GAME…</div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ minHeight:"100vh", background:"#f4f5f7", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:13, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>Game not found.</div>
          <button onClick={() => router.push("/")} style={{ marginTop:16, padding:"8px 20px", background:"#C8102E", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:13 }}>← SCOREBOARD</button>
        </div>
      </div>
    );
  }

  const isLive  = game.status?.type === "LIVE";
  const isFinal = game.status?.type === "FINAL";
  const awayWin = (isFinal || isLive) && game.away.score > game.home.score;
  const homeWin = (isFinal || isLive) && game.home.score > game.away.score;

  const awayBatters  = summary?.away?.batters  || [];
  const homeBatters  = summary?.home?.batters  || [];
  const awayPitchers = summary?.away?.pitchers || [];
  const homePitchers = summary?.home?.pitchers || [];

  return (
    <div style={{ minHeight:"100vh", background:"#f4f5f7", fontFamily:"'Oswald',sans-serif" }}>
      {/* Nav */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid #ededed", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 0" }}>
            <button onClick={() => router.push("/")} style={{ background:"#f5f5f5", border:"none", borderRadius:8, cursor:"pointer", padding:"8px 14px", display:"flex", alignItems:"center", gap:6, fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:13, color:"#555", letterSpacing:"0.06em" }}>
              ← SCOREBOARD
            </button>
            <div style={{ height:20, width:1, background:"#eee" }} />
            <span style={{ fontFamily:"'Oswald',sans-serif", fontWeight:700, fontSize:14, color:"#888", letterSpacing:"0.04em" }}>
              {game.away.abbr} vs {game.home.abbr}
            </span>
            {isLive && (
              <div style={{ display:"flex", alignItems:"center", gap:5, background:"#FFF1F2", border:"1px solid #FFD0D4", borderRadius:20, padding:"4px 11px" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#E8000D", animation:"pulse 1.2s infinite" }} />
                <span style={{ fontSize:10, fontWeight:800, color:"#E8000D", letterSpacing:"0.1em" }}>LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 40px", animation:"fadeUp .35s ease" }}>

        {/* Hero */}
        <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #ececec", overflow:"hidden", marginBottom:20, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ background: isLive ? "#FFF1F2" : "#fafafa", borderBottom:"1px solid #f0f0f0", padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'Lato',sans-serif" }}>{game.venue || game.confName || "College Baseball"}</span>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {isLive && <><div style={{ width:7, height:7, borderRadius:"50%", background:"#E8000D", animation:"pulse 1.2s infinite" }} /><span style={{ fontSize:11, fontWeight:800, color:"#E8000D", letterSpacing:"0.1em" }}>LIVE</span></>}
              <span style={{ fontSize:11, color: isLive ? "#E8000D" : "#888", fontFamily:"'Oswald',sans-serif", fontWeight:600 }}>{game.status.label}</span>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", padding:"28px 24px 20px", gap:16 }}>
            {/* Away */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, opacity: isFinal && !awayWin ? 0.45 : 1 }}>
              <Logo src={game.away.logo} name={game.away.name} size={76} />
              <div style={{ textAlign:"center" }}>
                {game.away.rank && <div style={{ fontSize:10, color:"#aaa", fontFamily:"'Oswald',sans-serif", marginBottom:2 }}>#{game.away.rank}</div>}
                <div style={{ fontSize:18, fontWeight:700, color:"#111", fontFamily:"'Oswald',sans-serif" }}>{game.away.name}</div>
                <div style={{ fontSize:11, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>{game.away.record} · AWAY</div>
              </div>
            </div>

            {/* Score */}
            <div style={{ textAlign:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
                <span style={{ fontSize:56, fontWeight:900, color: awayWin ? "#111" : isFinal ? "#bbb" : "#111", fontFamily:"'Oswald',sans-serif", lineHeight:1 }}>
                  {game.status.type !== "SCHEDULED" ? game.away.score : ""}
                </span>
                <span style={{ fontSize:28, color:"#ddd", fontFamily:"'Oswald',sans-serif" }}>–</span>
                <span style={{ fontSize:56, fontWeight:900, color: homeWin ? "#111" : isFinal ? "#bbb" : "#111", fontFamily:"'Oswald',sans-serif", lineHeight:1 }}>
                  {game.status.type !== "SCHEDULED" ? game.home.score : ""}
                </span>
              </div>
              {game.status.type === "SCHEDULED" && (
                <div style={{ fontSize:16, color:"#bbb", fontFamily:"'Oswald',sans-serif", marginTop:4 }}>{game.status.label}</div>
              )}
              {isLive && (
                <div style={{ marginTop:14 }}>
                  <Diamond onFirst={game.onFirst} onSecond={game.onSecond} onThird={game.onThird} outs={game.outs} />
                  <div style={{ fontSize:11, color:"#aaa", fontFamily:"'Oswald',sans-serif", marginTop:6 }}>
                    {game.balls}-{game.strikes} COUNT · {game.outs} OUT{game.outs !== 1 ? "S" : ""}
                  </div>
                </div>
              )}
            </div>

            {/* Home */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, opacity: isFinal && !homeWin ? 0.45 : 1 }}>
              <Logo src={game.home.logo} name={game.home.name} size={76} />
              <div style={{ textAlign:"center" }}>
                {game.home.rank && <div style={{ fontSize:10, color:"#aaa", fontFamily:"'Oswald',sans-serif", marginBottom:2 }}>#{game.home.rank}</div>}
                <div style={{ fontSize:18, fontWeight:700, color:"#111", fontFamily:"'Oswald',sans-serif" }}>{game.home.name}</div>
                <div style={{ fontSize:11, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>{game.home.record} · HOME</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop:"1px solid #f5f5f5", padding:"14px 20px" }}>
            <InningTable game={game} />
          </div>
        </div>

        {/* Player Stats */}
        {(isLive || isFinal) && (
          <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid #ececec", padding:"22px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:"0.12em", fontFamily:"'Oswald',sans-serif", marginBottom:20 }}>PLAYER STATS</div>
            <StatTable team={game.away} batters={awayBatters} pitchers={awayPitchers} loading={statsLoading} />
            <div style={{ height:1, background:"#f0f0f0", marginBottom:24 }} />
            <StatTable team={game.home} batters={homeBatters} pitchers={homePitchers} loading={statsLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
