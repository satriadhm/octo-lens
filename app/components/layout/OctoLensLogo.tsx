"use client";

import Image from "next/image";

interface OctoLensLogoProps {
  size?: number;
}

export function OctoLensLogo({ size = 36 }: OctoLensLogoProps) {
  const width = Math.round(size * 3.2);

  return (
    <Image
      src="/OCTO Lens - OCTO Hackfest 2026.png"
      alt="OCTO Lens"
      width={width}
      height={size}
      priority
      style={{ objectFit: "contain" }}
    />
  );
}
