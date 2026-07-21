"use client";

import { useTheme } from "@/components/theme/theme-provider";

/** Fixed aurora mesh backdrop — visible in dark mode only */
export function MeshBackground() {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme !== "dark") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="mesh-aurora absolute inset-0" />
      <div
        className="mesh-glow -left-24 top-[10%] h-[420px] w-[420px] opacity-50"
        style={{ background: "var(--ink-cyan)" }}
      />
      <div
        className="mesh-glow right-[-10%] top-[20%] h-[380px] w-[380px] opacity-45"
        style={{ background: "var(--ink-magenta)" }}
      />
      <div
        className="mesh-glow bottom-[5%] left-[30%] h-[340px] w-[340px] opacity-35"
        style={{ background: "var(--ink-orange)" }}
      />
      <div
        className="mesh-glow bottom-[20%] right-[25%] h-[280px] w-[280px] opacity-30"
        style={{ background: "var(--ink-purple)" }}
      />
    </div>
  );
}
