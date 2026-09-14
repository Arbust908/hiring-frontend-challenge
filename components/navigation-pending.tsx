"use client";

import { useLinkStatus } from "next/link";

export function NavigationPending() {
  const { pending } = useLinkStatus();
  return (
    <span role="status" className="ml-2 inline-block h-4 w-4 align-middle">
      <span className="sr-only">{pending ? "Cargando página…" : ""}</span>
      <span
        aria-hidden="true"
        className={`block h-4 w-4 rounded-full border-2 border-current border-r-transparent transition-opacity ${
          pending ? "opacity-100 delay-150 motion-safe:animate-spin" : "opacity-0"
        }`}
      />
    </span>
  );
}
