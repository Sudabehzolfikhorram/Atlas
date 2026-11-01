import React from "react";
import { motion } from "framer-motion";
import type { GaugeSatellite } from "../../types/analysis";
const CX = 280;
const CY = 292;
function polar(r: number, deg: number) {
  const a = deg * Math.PI / 180;
  return {
    x: CX + r * Math.cos(a),
    y: CY - r * Math.sin(a)
  };
}
function ticks(count: number, r1: number, r2: number) {
  return Array.from({
    length: count + 1
  }).map((_, i) => {
    const deg = 180 / count * i;
    const p1 = polar(r1, deg);
    const p2 = polar(r2, deg);
    return {
      key: i,
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y
    };
  });
}
interface Props {
  value: number;
  label: string;
  satellites: GaugeSatellite[];
  /** Changing this replays the arc animation when new results arrive. */
  animationKey?: string | number;
  muted?: boolean;
}
export function HealthGauge({
  value,
  label,
  satellites,
  animationKey,
  muted = false
}: Props) {
  const r = 98;
  const endDeg = 180 - 180 * value / 100;
  const start = polar(r, 180);
  const end = polar(r, endDeg);
  const ring = 160;
  const ringStart = polar(ring, 180);
  const ringEnd = polar(ring, 0);
  return <svg viewBox="0 0 560 310" className={`h-auto w-full transition-opacity ${muted ? "opacity-60" : "opacity-100"}`} role="img" aria-label={`${label} ${value} out of 100`} style={{
    paddingBottom: "20px"
  }}>
      {ticks(110, 246, 262).map((t) => <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(148,163,184,0.22)" strokeWidth="1.2" />)}
      <path d={`M ${ringStart.x} ${ringStart.y} A ${ring} ${ring} 0 0 1 ${ringEnd.x} ${ringEnd.y}`} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
      {ticks(80, 120, 132).map((t) => <line key={`i${t.key}`} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(148,163,184,0.16)" strokeWidth="1.4" />)}
      <circle cx={CX} cy={CY} r={88} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.14)" />
      <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${polar(r, 0).x} ${polar(r, 0).y}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
      <motion.path key={animationKey} d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`} fill="none" stroke="#3B82F6" strokeWidth="9" strokeLinecap="round" initial={{
      pathLength: 0
    }} animate={{
      pathLength: 1
    }} transition={{
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1]
    }} />
      {satellites.map((s) => {
      const dot = polar(ring, s.angle);
      const lbl = polar(206, s.angle);
      return <g key={s.label}>
            <circle cx={dot.x} cy={dot.y} r="7" fill={s.tone} opacity="0.18" />
            <circle cx={dot.x} cy={dot.y} r="3.5" fill={s.tone} />
            <text x={lbl.x} y={lbl.y - 4} textAnchor="middle" fill="#F1F5F9" fontSize="20" fontWeight="500" className="num">
              {s.value}
              {s.unit && <tspan fontSize="11" fill="#94A3B8" dx="2">
                  {s.unit}
                </tspan>}
            </text>
            <text x={lbl.x} y={lbl.y + 13} textAnchor="middle" fill="#94A3B8" fontSize="11.5">
              {s.label}
            </text>
          </g>;
    })}
      <text x={CX} y={254} textAnchor="middle" fill="#FFFFFF" fontSize="40" fontWeight="700" className="num" letterSpacing="-1">
        {value}
        <tspan fontSize="16" fill="#64748B" dx="4" letterSpacing="0">
          /100
        </tspan>
      </text>
      <text x={CX} y={282} textAnchor="middle" fill="#CBD5E1" fontSize="13">
        {label}
      </text>
    </svg>;
}