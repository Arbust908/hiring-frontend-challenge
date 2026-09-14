"use client";

import { useState } from "react";

export function VehicleImage({ src, alt, priority = false, className = "" }: { src?: string; alt: string; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt}: imagen no disponible`}
        className="flex h-full w-full flex-col items-center justify-center gap-3 bg-paper-2 p-3 text-center text-muted"
      >
        <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-10 w-20">
          <path d="m9 25 5-12h40l11 12h7v8H8v-8h1Zm9-12 4-6h25l7 6M14 25h51M30 13v12m18-12 7 12" />
          <circle cx="22" cy="33" r="5" />
          <circle cx="58" cy="33" r="5" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">Imagen no disponible</span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={1200} height={900} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} onError={() => setFailed(true)} className={`h-full w-full object-cover ${className}`} />;
}
