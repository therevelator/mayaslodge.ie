"use client";

import { useState } from "react";
import Image from "next/image";

export function Gallery({
  images,
  roomName,
}: {
  images: { url: string; alt: string | null }[];
  roomName: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-[3/2] w-full rounded-2xl bg-cream-deep" />;
  }
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-cream-deep">
        <Image
          src={current.url}
          alt={current.alt ?? roomName}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${
                i === active ? "ring-brand" : "ring-transparent hover:ring-brand/40"
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
