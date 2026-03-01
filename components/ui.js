"use client";
import { useState } from "react";

// ── Logo ─────────────────────────────────────────────────────────────────────
export function Logo({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: "linear-gradient(135deg,#e8e8e8,#d4d4d4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 800, color: "#999",
        fontFamily: "'Oswald',sans-serif", flexShrink: 0,
      }}>{name?.[0] || "?"}</div>
    );
  }
  return (
    <img
      src={src} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
      loading="lazy"
    />
  );
}

// ── Bases / Diamond ───────────────────────────────────────────────────────────
export function Diamond({ onFirst, onSecond, onThird, outs }) {
  const Base = ({ on }) => (
    <div style={{
      width: 11, height: 11, transform: "rotate(45deg)", borderRadius: 2,
      background: on ? "#F5A623" : "transparent",
      border: `2px solid ${on ? "#F5A623" : "#ccc"}`,
      boxShadow: on ? "0 0 6px rgba(245,166,35,.5)" : "none",
    }} />
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <Base on={onSecond} />
      <div style={{ display: "flex", gap: 14 }}>
        <Base on={onThird} /><div style={{ width: 11 }} /><Base on={onFirst} />
      </div>
      <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i < outs ? "#E8000D" : "#e5e5e5",
            border: "1px solid #ddd",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Inning linescore table ────────────────────────────────────────────────────
export function InningTable({ game }) {
  const { innings = [], away, home } = game;
  const cols = Math.max(9, innings.filter(i => i.away !== null || i.home !== null).length);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Oswald',sans-serif", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
            <td style={{ width: 130, paddingBottom: 6, color: "#bbb", fontSize: 10 }} />
            {Array.from({ length: cols }, (_, i) => (
              <td key={i} style={{ textAlign:"center", width:28, paddingBottom:6, color:"#bbb", fontSize:11, fontWeight:500 }}>{i+1}</td>
            ))}
            <td style={{ textAlign:"center", width:32, paddingBottom:6, fontWeight:800, color:"#111", fontSize:13 }}>R</td>
            <td style={{ textAlign:"center", width:28, paddingBottom:6, color:"#bbb", fontSize:11 }}>H</td>
            <td style={{ textAlign:"center", width:28, paddingBottom:6, color:"#bbb", fontSize:11 }}>E</td>
          </tr>
        </thead>
        <tbody>
          {[away, home].map((team, ti) => (
            <tr key={ti} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ paddingTop:8, paddingBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Logo src={team?.logo} name={team?.name} size={22} />
                  <span style={{ fontWeight:600, color:"#333", fontSize:12 }}>{team?.abbr || team?.shortName}</span>
                </div>
              </td>
              {Array.from({ length: cols }, (_, i) => {
                const val = ti === 0 ? innings[i]?.away : innings[i]?.home;
                return (
                  <td key={i} style={{ textAlign:"center", paddingTop:8, paddingBottom:8, color: val > 0 ? "#111" : "#ccc", fontWeight: val > 0 ? 700 : 400 }}>
                    {val !== null && val !== undefined ? (val === 0 ? "·" : val) : ""}
                  </td>
                );
              })}
              <td style={{ textAlign:"center", fontWeight:900, fontSize:15, color:"#111", paddingTop:8, paddingBottom:8 }}>{team?.score}</td>
              <td style={{ textAlign:"center", color:"#888", paddingTop:8, paddingBottom:8 }}>{team?.hits}</td>
              <td style={{ textAlign:"center", color:"#888", paddingTop:8, paddingBottom:8 }}>{team?.errors}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
