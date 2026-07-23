function ThoughtBubble({ color = "var(--thought-bubble-blue)", width = 320 , fill = "#d9e8f6ff"}) {
  return (
    <svg
      viewBox="0 0 220 150"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 45 45
           C 45 28, 60 18, 75 22
           C 80 10, 100 8, 108 18
           C 118 8, 138 10, 142 24
           C 158 22, 172 34, 168 50
           C 182 54, 186 72, 174 82
           C 182 94, 172 110, 156 108
           C 154 122, 136 130, 124 120
           C 116 132, 96 132, 90 120
           C 76 128, 58 120, 58 104
           C 42 104, 32 88, 40 74
           C 30 66, 32 50, 45 45 Z"
        fill={fill}
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="128" r="8" fill={fill} stroke={color} strokeWidth="3.5" />
      <circle cx="24" cy="144" r="5" fill={fill} stroke={color} strokeWidth="3" />
    </svg>
  );
}

export default ThoughtBubble;