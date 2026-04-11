/** Geometric SVG background pattern matching v009 design language */
export const GeoBg = () => (
  <svg
    className="geo-bg"
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="geo-lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--positive))" />
        <stop offset="100%" stopColor="hsl(var(--primary))" />
      </linearGradient>
    </defs>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${60 + i * 30}, ${80 + i * 20})`}>
        <ellipse
          cx="0" cy="0"
          rx={180 - i * 20} ry={140 - i * 15}
          fill="none" stroke="url(#geo-lg)" strokeWidth={1.2}
          transform={`rotate(${-25 + i * 8})`}
        />
      </g>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <g key={`r${i}`} transform={`translate(${-40 + i * 25}, ${120 + i * 30})`}>
        <rect
          x="-80" y="-80" width="160" height="160" rx="20"
          fill="none" stroke="url(#geo-lg)" strokeWidth={1}
          transform={`rotate(${45 + i * 12})`}
        />
      </g>
    ))}
  </svg>
);
