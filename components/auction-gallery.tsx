"use client";

import { useState } from "react";
import { VehicleImage } from "@/components/vehicle-image";

export function AuctionGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState(0);
  const active = selected < images.length ? selected : 0;
  return (
    <section aria-label="Fotos del vehículo">
      <div className="relative aspect-video overflow-hidden rounded-card border border-rule bg-paper-2">
        <VehicleImage
          key={images[active] ?? "empty"}
          src={images[active]}
          alt={`${title}, foto ${active + 1}`}
          priority
          className="animate-photo-in"
        />
        {images.length > 0 && (
          <p
            aria-live="polite"
            className="absolute bottom-3 right-3 rounded-xs bg-panel/90 px-2.5 py-1.5 font-mono text-xs tabular-nums text-on-dark"
          >
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </p>
        )}
      </div>
      <div className="auction-thumbnails mt-3 flex h-18 gap-2 overflow-x-auto p-1">
        {images.length > 1 &&
          images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1} de ${title}`}
              aria-pressed={active === index}
              className={`h-full w-22 shrink-0 overflow-hidden rounded-md border transition-[border-color,opacity] duration-200 ease-out ${
                active === index
                  ? "border-accent opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <VehicleImage src={src} alt={`Miniatura ${index + 1}`} />
            </button>
          ))}
      </div>
    </section>
  );
}
