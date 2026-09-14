"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export function AuctionCardLink({ href, children }: { href: string; children: ReactNode }) {
  const [prefetch, setPrefetch] = useState(false);
  const prepare = () => setPrefetch(true);

  return (
    <Link href={href} prefetch={prefetch} onMouseEnter={prepare} onFocus={prepare} onTouchStart={prepare} className="flex flex-1 flex-col">
      {children}
    </Link>
  );
}
