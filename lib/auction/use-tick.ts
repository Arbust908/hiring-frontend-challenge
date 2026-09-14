"use client";

import { useEffect, useState } from "react";

export function useTick() {
  const [tick, setTick] = useState<{ monotonic: number; wall: number } | null>(null);

  useEffect(() => {
    const update = () => setTick({ monotonic: performance.now(), wall: Date.now() });
    const timer = window.setInterval(update, 1000);
    const frame = window.requestAnimationFrame(update);
    return () => { window.clearInterval(timer); window.cancelAnimationFrame(frame); };
  }, []);

  return tick;
}
