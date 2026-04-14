"use client";

interface OctoLensLogoProps {
  size?: number;
}

export function OctoLensLogo({ size = 36 }: OctoLensLogoProps) {
  return (
    <svg
      width={size * 3.2}
      height={size}
      viewBox="0 0 115 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="11" stroke="#CC1122" strokeWidth="3" fill="none" />
      <line x1="22" y1="22" x2="30" y2="30" stroke="#CC1122" strokeWidth="3.5" strokeLinecap="round" />
      <polyline
        points="7,14 10,14 12,9 14,19 16,11 18,14 21,14"
        stroke="#CC1122"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <text
        x="36"
        y="23"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontWeight="900"
        fontSize="20"
        fill="#CC1122"
        letterSpacing="-0.5"
      >
        OCTO
      </text>
      <text
        x="83"
        y="23"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontWeight="600"
        fontSize="17"
        fill="#6B0A14"
        letterSpacing="0"
      >
        Lens
      </text>
    </svg>
  );
}
