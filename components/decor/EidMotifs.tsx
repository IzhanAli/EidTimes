/**
 * Hand-drawn SVG motifs for the two Eids. Pure presentational components —
 * colours come from currentColor / CSS variables so they re-theme with the
 * active occasion, and all motion is CSS-driven (classes in globals.css).
 */

export function CrescentGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M14.6 2.6a9.6 9.6 0 1 0 6.8 13.9 8 8 0 0 1-6.8-13.9Z" />
      <path d="M17.8 4.2l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" />
    </svg>
  );
}

export function KaabaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 2.4 21 7v10l-9 4.6L3 17V7l9-4.6Zm0 2.3L5 8.2v.9l7 3.5 7-3.5v-.9l-7-3.5ZM5 11.3V16l6 3.1v-4.8l-6-3Zm14 0-6 3v4.8l6-3.1v-4.7Z" />
    </svg>
  );
}

export function EightPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 1.5l2.2 5.1 5.1-2-2 5.2 5.2 2.2-5.2 2.2 2 5.1-5.1-2L12 22.5l-2.2-5.2-5.1 2 2-5.1L1.5 12l5.2-2.2-2-5.2 5.1 2L12 1.5Z" />
    </svg>
  );
}

function Sparkle({ x, y, s, d }: { x: number; y: number; s: number; d: string }) {
  return (
    <path
      className="motif-twinkle"
      style={{ animationDelay: d }}
      fill="currentColor"
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
    />
  );
}

function Lantern({
  x,
  y,
  s = 1,
  delay = "0s",
  rope = 24,
}: {
  x: number;
  y: number;
  s?: number;
  delay?: string;
  rope?: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1={-rope} x2="0" y2="0" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <g className="motif-sway" style={{ animationDelay: delay }} transform={`scale(${s})`}>
        <circle cx="0" cy="2" r="2" fill="currentColor" />
        {/* body */}
        <path
          d="M-7 8 Q0 2 7 8 L8.5 24 Q0 30 -8.5 24 Z"
          fill="currentColor"
          opacity="0.92"
        />
        {/* glass glow */}
        <ellipse className="motif-glow" cx="0" cy="16" rx="4.6" ry="7" fill="var(--glow, #f3c969)" />
        {/* ribs */}
        <path d="M0 6 L0 27 M-4.5 7 L-5.5 25 M4.5 7 L5.5 25" stroke="currentColor" strokeWidth="1" opacity="0.55" fill="none" />
        {/* finial */}
        <path d="M-3 26.5 Q0 31 3 26.5 L1.6 33 Q0 35 -1.6 33 Z" fill="currentColor" />
      </g>
    </g>
  );
}

/** Night scene for Eid al-Fitr: gold crescent, twinkling stars, swaying lanterns. */
export function FitrScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 170" className={className} aria-hidden>
      <g style={{ color: "var(--hero-gold, #e3b54d)" }}>
        {/* crescent */}
        <g className="motif-float">
          <path
            d="M196 22a44 44 0 1 0 30 61 36 36 0 0 1-30-61Z"
            fill="currentColor"
          />
          <Sparkle x={216} y={42} s={1.1} d="0.4s" />
        </g>
        <Sparkle x={28} y={30} s={1} d="0s" />
        <Sparkle x={70} y={14} s={0.65} d="1.1s" />
        <Sparkle x={120} y={40} s={0.8} d="0.6s" />
        <Sparkle x={48} y={74} s={0.55} d="1.6s" />
        <Sparkle x={246} y={120} s={0.7} d="0.9s" />
        <Lantern x={42} y={56} s={1} delay="0s" rope={56} />
        <Lantern x={96} y={78} s={0.78} delay="0.8s" rope={78} />
        <Lantern x={140} y={64} s={0.6} delay="1.4s" rope={64} />
      </g>
    </svg>
  );
}

/** Day-of-pilgrimage scene for Eid al-Adha: Kaaba under a radiant arch and stars. */
export function AdhaScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 170" className={className} aria-hidden>
      <g style={{ color: "var(--hero-gold, #e9c25f)" }}>
        {/* radiating arch */}
        <g className="motif-rays" opacity="0.5">
          {Array.from({ length: 9 }).map((_, i) => {
            const a = Math.PI - (Math.PI * (i + 0.5)) / 9;
            const x1 = 130 + Math.cos(a) * 58;
            const y1 = 130 - Math.sin(a) * 58;
            const x2 = 130 + Math.cos(a) * 84;
            const y2 = 130 - Math.sin(a) * 84;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            );
          })}
        </g>
        <path
          d="M40 130 A90 90 0 0 1 220 130"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2 7"
          opacity="0.65"
        />
        <Sparkle x={34} y={42} s={0.9} d="0.2s" />
        <Sparkle x={226} y={36} s={0.7} d="1.2s" />
        <Sparkle x={244} y={84} s={0.55} d="0.7s" />
        <Sparkle x={16} y={92} s={0.55} d="1.7s" />
        {/* Kaaba */}
        <g className="motif-float">
          <path d="M130 64 L172 84 v44 l-42 21 -42-21 V84 Z" fill="currentColor" opacity="0.18" />
          <path d="M130 64 L172 84 130 105 88 84 Z" fill="currentColor" />
          <path d="M88 84 v44 l42 21 v-44 Z" fill="currentColor" opacity="0.82" />
          <path d="M172 84 v44 l-42 21 v-44 Z" fill="currentColor" opacity="0.62" />
          {/* gold band */}
          <path d="M88 95 l42 21 42-21" fill="none" stroke="var(--glow, #f6e0a4)" strokeWidth="5" opacity="0.9" />
          {/* door */}
          <path d="M124 134 v-18 q6 -4 12 0 v24 Z" fill="var(--glow, #f6e0a4)" opacity="0.75" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Wide mosque skyline silhouette — domes, minarets, and arches. Sits above
 * the footer; stretches to its container width and inherits currentColor.
 */
export function MosqueSkyline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 110" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden fill="currentColor">
      {/* ground line buildings */}
      <path d="M0 110 V96 h70 V78 h14 V96 h60 V60
        h10 l2-12 2 12 h10 V110 Z" />
      {/* left minaret */}
      <path d="M210 110 V44 h6 l3-22 3 22 h6 v66 Z" />
      <path d="M196 110 V84 h52 v26 Z" />
      {/* central mosque: big dome + flanking arches */}
      <path d="M300 110 V88 h36 V74 q0-8 9-8 t9 8 v14 h32 V70
        q44-50 88 0 v18 h32 V74 q0-8 9-8 t9 8 v14 h36 v22 Z" />
      <path d="M474 32 q-2 14 -14 22 q14 4 14 16 q0-12 14-16 q-12-8 -14-22 Z" />
      {/* crescent finial */}
      <path d="M474 8 a9 9 0 1 0 6.4 13.2 7.2 7.2 0 0 1-6.4-13.2 Z" transform="translate(0 6)" />
      {/* right minaret */}
      <path d="M640 110 V40 h7 l3.5-24 3.5 24 h7 v70 Z" />
      <path d="M626 110 V86 h56 v24 Z" />
      {/* small domed pavilion */}
      <path d="M760 110 V90 h16 V80 q12-18 28 0 v10 h16 v20 Z" />
      {/* arcaded wall */}
      <path d="M850 110 V82 h22 v10 q5-9 11-1 v19 h16 v-19 q5-8 11 1 v-10 h22 v28 Z" />
      {/* far buildings */}
      <path d="M970 110 V92 h44 V70 h10 l2-10 2 10 h10 v22 h40 V86 h60 v24 Z" />
      <path d="M1150 110 V74 h6 l3-16 3 16 h6 v36 Z" />
    </svg>
  );
}

/** A thin decorative divider — alternating eight-point stars and dots. */
export function StarDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className ?? ""}`} aria-hidden>
      <span className="h-px w-16 bg-current opacity-30" />
      <EightPointStar className="h-2.5 w-2.5 opacity-60" />
      <EightPointStar className="h-3.5 w-3.5" />
      <EightPointStar className="h-2.5 w-2.5 opacity-60" />
      <span className="h-px w-16 bg-current opacity-30" />
    </div>
  );
}
