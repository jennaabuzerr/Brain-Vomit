function BrainIcon({
  color = "var(--brain-pink)",
  fill = "#ffe0ec",
  width = 260,
}) {
  return (
    <svg viewBox="0 0 200 170" width={width} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 70 20
           C 55 15, 35 25, 32 42
           C 20 45, 12 60, 18 74
           C 10 82, 12 98, 24 104
           C 20 118, 30 132, 46 132
           C 48 145, 62 152, 74 146
           C 80 155, 96 155, 100 146
           C 104 155, 120 155, 126 146
           C 138 152, 152 145, 154 132
           C 170 132, 180 118, 176 104
           C 188 98, 190 82, 182 74
           C 188 60, 180 45, 168 42
           C 165 25, 145 15, 130 20
           C 122 10, 106 10, 100 20
           C 94 10, 78 10, 70 20 Z"
        fill={fill}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 100 20 C 98 45, 102 70, 100 95 C 98 115, 102 130, 100 146"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 70 20 C 60 35, 58 50, 66 62 C 56 68, 54 82, 62 90 C 54 98, 56 112, 66 116"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 130 20 C 140 35, 142 50, 134 62 C 144 68, 146 82, 138 90 C 146 98, 144 112, 134 116"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 40 55 C 45 60, 45 68, 40 72"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 160 55 C 155 60, 155 68, 160 72"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default BrainIcon;
