"use client";

import { useState, useEffect } from "react";

const LINE_1 = "Skip the Queue,";
const LINE_2 = "Get Care Faster.";
const CHAR_DELAY_MS = 80;
const PAUSE_BETWEEN_LINES_MS = 400;

export function TypewriterHero() {
  const [line1Len, setLine1Len] = useState(0);
  const [line2Len, setLine2Len] = useState(0);
  const [phase, setPhase] = useState<"line1" | "line2" | "done">("line1");

  useEffect(() => {
    if (phase === "line1") {
      if (line1Len < LINE_1.length) {
        const t = setTimeout(() => setLine1Len((n) => n + 1), CHAR_DELAY_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("line2"), PAUSE_BETWEEN_LINES_MS);
      return () => clearTimeout(t);
    }
    if (phase === "line2") {
      if (line2Len < LINE_2.length) {
        const t = setTimeout(() => setLine2Len((n) => n + 1), CHAR_DELAY_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("done"), 0);
      return () => clearTimeout(t);
    }
  }, [phase, line1Len, line2Len]);

  const cursor = (
    <span
      className="inline-block w-0.5 min-w-0.5 h-[0.9em] align-middle bg-current animate-pulse ml-0.5"
      aria-hidden
    />
  );

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
      <span>
        {LINE_1.slice(0, line1Len)}
        {phase === "line1" && cursor}
      </span>
      <br className="hidden sm:block" />
      <span className="text-primary">
        {LINE_2.slice(0, line2Len)}
        {phase === "line2" && cursor}
      </span>
    </h1>
  );
}
