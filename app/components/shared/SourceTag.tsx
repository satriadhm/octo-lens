"use client";

interface SourceTagProps {
  source: string;
}

export function SourceTag({ source }: SourceTagProps) {
  return (
    <span className="absolute top-3 right-4 text-[10px] text-txt-dim font-mono">
      source: {source}
    </span>
  );
}
