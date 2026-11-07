import * as React from "react";
import { cn } from "@/lib/utils";

export function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        tabIndex={0}
        className="cursor-help underline decoration-dotted"
        aria-label={text}
      >
        {children}
      </span>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-foreground text-background text-xs p-2 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}