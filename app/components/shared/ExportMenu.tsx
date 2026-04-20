"use client";

import { useEffect, useRef, useState } from "react";

interface ExportMenuProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export function ExportMenu({ onExportCSV, onExportPDF }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function run(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative z-[120]" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-txt cursor-pointer transition-colors hover:border-brand/30 hover:bg-brand-light/30 focus-visible:outline-2 focus-visible:outline-brand/40"
      >
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true">&#11015;</span>
          Export
          <span aria-hidden="true">{open ? "\u25B2" : "\u25BC"}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[130px] rounded-lg border border-border bg-surface shadow-lg z-[130] p-1"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onExportCSV)}
            className="w-full text-left px-2.5 py-2 rounded-md text-xs text-txt hover:bg-brand-light/40 transition-colors cursor-pointer"
          >
            Download CSV
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => run(onExportPDF)}
            className="w-full text-left px-2.5 py-2 rounded-md text-xs text-txt hover:bg-brand-light/40 transition-colors cursor-pointer"
          >
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
