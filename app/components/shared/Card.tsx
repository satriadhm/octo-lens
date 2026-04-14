"use client";

import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className = "", style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-xl p-3.5 shadow-sm
        ${onClick ? "cursor-pointer hover:border-brand hover:shadow-[0_2px_10px_rgba(204,17,34,0.10)]" : ""}
        transition-all duration-150 ${className}`}
      style={style}
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
      className="font-mono text-[9px] tracking-[0.15em] mb-1.5 uppercase"
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
      className="text-[10px] font-bold rounded-[5px] px-2 py-0.5"
      style={{ color, background: bg, border: `1px solid ${color}30` }}
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
      className="text-[9px] font-mono tracking-[0.05em] rounded-full px-2 py-0.5"
      style={{ color, background: bg, border: `1px solid ${color}25` }}
    >
      {label}
    </span>
  );
}
