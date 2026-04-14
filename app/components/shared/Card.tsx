"use client";

import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  variant?: "surface" | "bordered" | "interactive";
}

export function Card({
  children,
  className = "",
  style,
  onClick,
  variant = "bordered",
}: CardProps) {
  const base = "rounded-xl transition-all duration-150";
  const variants = {
    surface: `${base} bg-surface-dim/50 p-4`,
    bordered: `${base} bg-surface border border-border p-4`,
    interactive: `${base} bg-surface border border-border p-4 cursor-pointer
      hover:border-brand/30 hover:bg-brand-light/30
      focus-visible:outline-2 focus-visible:outline-brand/40 focus-visible:outline-offset-2`,
  };

  return (
    <div
      onClick={onClick}
      className={`${variants[onClick ? "interactive" : variant]} ${className}`}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

interface LabelProps {
  children: ReactNode;
  color?: string;
}

export function Label({ children, color }: LabelProps) {
  return (
    <div
      className="text-[11px] font-semibold tracking-[0.06em] mb-1.5 uppercase font-display"
      style={{ color: color ?? "var(--color-text-dim)" }}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color: string;
  bg: string;
}

export function Badge({ children, color, bg }: BadgeProps) {
  return (
    <span
      className="text-[11px] font-semibold rounded-md px-2 py-0.5 font-sans"
      style={{ color, background: bg, border: `1px solid ${color}20` }}
    >
      {children}
    </span>
  );
}

interface PillProps {
  label: string;
  color: string;
  bg: string;
}

export function Pill({ label, color, bg }: PillProps) {
  return (
    <span
      className="text-[10px] font-medium tracking-[0.03em] rounded-full px-2.5 py-0.5 font-sans"
      style={{ color, background: bg, border: `1px solid ${color}18` }}
    >
      {label}
    </span>
  );
}
