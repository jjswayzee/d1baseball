"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "../components/ui";

const TABS = ["ALL", "SEC", "ACC", "Big 12", "Big Ten"];

function GameCard({ game }) {
  const router = useRouter();
  const isLive = game.status?.type === "LIVE";
  const isFinal = game.status?.type === "FINAL";
  const awayWin = isFinal && game.away.score > game.home.score;
  const homeWin = isFinal && game.home.score > game.away.score;
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={() => router.push(`/game/${game.id}`)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: `1.5px solid ${isLive ? "#ffc5c8" : "#ececec"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: hov ? "0 8px 28px rgba(0,0,0,0.11)" : isLive ? "0 3px 16px rgba(232,0,13,0.08)" : "0 1px 6px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        animation: "fadeUp 0.35s ease both",
      }}
    >
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", background:"#fafafa", borderBottom:"1px solid #f5f5f5" }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", color:"#555", fontFamily:"'Oswald',sans-serif", textTransform:"uppercase" }}>
          {game.confName || game.conference || "COLLEGE BASEBALL"}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {isLive && (
            <>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#E8000D", animation:"pulse 1.2s infinite" }} />
              <span style={{ fontSize:9, fontWeight:800, color:"#E8000D", fontFamily:"'Oswald',sans-serif", letterSpacing:"0.1em" }}>LIVE</span>
              <span style={{ fontSize:9, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>
                {game.isTop ? "▲" : "▼"}{game.inning}
              </span>
            </>
          )}
          {isFinal && <span style={{ fontSize:9, fontWeight:700, color:"#aaa", fontFamily:"'Oswald',sans-serif", letterSpacing:"0.1em" }}>FINAL</span>}
          {game.status?.type === "SCHEDULED" && <span style={{ fontSize:9, color:"#bbb", fontFamily:"'Oswald',sans-serif" }}>{game.status.label}</span>}
        </div>
      </div>

      {/* Teams */}
      <div style={{ padding:"14px 16px 12px" }}>
        {[{ t: game.away, win: awayWin, label:"AWAY" }, { t: game.home, win: homeWin, label:"HOME" }].map(({ t, win, label }, idx) => (
          <div key={idx} style={{
            display:"flex", alignItems:"center", gap:11,
            marginBottom: idx === 0 ? 10 : 0,
            opacity: isFinal && !win ? 0.38 : 1,
            transition:"opacity 0.2s",
          }}>
            <Logo src={t.logo} name={t.name} size={40} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:15, fontWeight: win ? 800 : 500, fontFamily:"'Oswald',sans-serif", color:"#1a1a1a", letterSpacing:"0.02em", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {t.rank ? <span style={{ fontSize:10, color:"#C8102E", fontWeight:700, marginRight:4 }}>#{t.rank}</span> : null}
                {t.name}
              </div>
              <div style={{ fontSize:9, color:"#ccc", fontFamily:"'Oswald',sans-serif", letterSpacing:"0.08em", marginTop:1 }}>{label}{t.record ? ` · ${t.record}` : ""}</div>
            </div>
            {game.status?.type !== "SCHEDULED" ? (
              <span style={{ fontSize:30, fontWeight:900, fontFamily:"'Oswald',sans-serif", color: win ? "#111" : "#999", lineHeight:1 }}>{t.score}</span>
            ) : (
              <span style={{ color:"#ddd", fontFamily:"'Oswald',sans-serif", fontSize:20 }}>—</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop:"1px solid #f8f8f8", padding:"6px 16px", display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:9, color:"#ddd", fontFamily:"'Oswald',sans-serif" }}>{game.venue || ""}</span>
        <span style={{ fontSize:9, color:"#ddd", fontFamily:"'Oswald',sans-serif", letterSpacing:"0.06em" }}>BOX SCORE →</span>
      </div>
    </div>
  );
}

export default function ScoreboardPage() {
  const [games, setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);
  const [tab, setTab]       = useState("ALL");
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const res  = await fetch("/api/scoreboard");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGames(data.games || []);
      setUpdated(new Date(data.updated));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const confAliases = {
    SEC: ["Southeastern Conference", "SEC"],
    ACC: ["Atlantic Coast Conference", "ACC"],
    "Big 12": ["Big 12 Conference", "Big 12"],
    "Big Ten": ["Big Ten Conference", "Big Ten"],
  };

  const filtered = tab === "ALL" ? games : games.filter((g) => {
    const aliases = confAliases[tab] || [tab];
    return aliases.some((a) => g.confName?.includes(a) || g.conference === tab);
  });

  const liveCount = games.filter((g) => g.status?.type === "LIVE").length;
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  return (
    <div style={{ minHeight:"100vh", background:"#f4f5f7" }}>
      {/* Header */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid #ededed", position:"sticky", top:0, zIndex:50, boxShadow:"0 2px 16px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 0 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#C8102E,#FF3D5A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 4px 14px rgba(200,16,46,.28)" }}>⚾</div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:"#111", letterSpacing:"0.05em", lineHeight:1.1, fontFamily:"'Oswald',sans-serif" }}>D1 BASEBALL</div>
                <div style={{ fontSize:10, color:"#bbb", fontFamily:"'Lato',sans-serif", letterSpacing:"0.08em" }}>POWER 4 LIVE SCORES · {today}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {liveCount > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:6, background:"#FFF1F2", border:"1px solid #FFD0D4", borderRadius:20, padding:"5px 13px" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#E8000D", animation:"pulse 1.2s infinite" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"#E8000D", letterSpacing:"0.08em", fontFamily:"'Oswald',sans-serif" }}>{liveCount} LIVE</span>
                </div>
              )}
              {updated && <span style={{ fontSize:10, color:"#ccc", fontFamily:"'Lato',sans-serif" }}>{updated.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:0, marginTop:10 }}>
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:13, letterSpacing:"0.08em",
                color: tab===t ? "#C8102E" : "#bbb",
                padding:"9px 18px",
                borderBottom:`2.5px solid ${tab===t ? "#C8102E" : "transparent"}`,
                transition:"all 0.15s",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #ededed" }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"10px 20px", display:"flex", alignItems:"center", gap:28 }}>
          {[
            { label:"Games Today", val:games.length, c:"#222" },
            { label:"In Progress", val:games.filter(g=>g.status?.type==="LIVE").length, c:"#E8000D" },
            { label:"Final", val:games.filter(g=>g.status?.type==="FINAL").length, c:"#888" },
            { label:"Upcoming", val:games.filter(g=>g.status?.type==="SCHEDULED").length, c:"#555" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontWeight:800, fontSize:18, color:s.c, fontFamily:"'Oswald',sans-serif" }}>{s.val}</span>
              <span style={{ fontSize:10, color:"#bbb", fontFamily:"'Lato',sans-serif", letterSpacing:"0.04em" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px 40px" }}>
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ width:32, height:32, border:"3px solid #f0f0f0", borderTop:"3px solid #C8102E", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
            <div style={{ color:"#bbb", fontFamily:"'Oswald',sans-serif", fontSize:13, letterSpacing:"0.08em" }}>LOADING LIVE SCORES...</div>
          </div>
        )}
        {error && !loading && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, color:"#bbb" }}>Could not load scores</div>
            <button onClick={load} style={{ marginTop:16, padding:"8px 20px", background:"#C8102E", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Oswald',sans-serif", fontWeight:600, fontSize:13 }}>RETRY</button>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚾</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:15, color:"#bbb", letterSpacing:"0.08em" }}>NO GAMES TODAY</div>
            <div style={{ fontFamily:"'Lato',sans-serif", fontSize:12, color:"#ddd", marginTop:8 }}>Check back during the season for live scores</div>
          </div>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:14 }}>
            {filtered.map((game, i) => (
              <div key={game.id} style={{ animationDelay:`${i*0.04}s` }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:36, fontSize:11, color:"#ccc", fontFamily:"'Lato',sans-serif" }}>
          Live data via ESPN · Auto-refreshes every 30 seconds
        </div>
      </div>
    </div>
  );
}
