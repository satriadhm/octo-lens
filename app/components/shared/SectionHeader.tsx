import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 pb-2 border-b border-border mb-1">
      <div>
        <h2 className="text-[13px] font-display font-bold text-txt leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-txt-dim mt-0.5 leading-none">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
