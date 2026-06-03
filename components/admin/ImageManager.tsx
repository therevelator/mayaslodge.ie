"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addRoomImage, deleteRoomImage } from "@/app/admin/actions";

type Img = { id: string; url: string; alt: string | null };

export function ImageManager({
  roomId,
  images,
}: {
  roomId: string;
  images: Img[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");

        const add = new FormData();
        add.append("roomId", roomId);
        add.append("url", data.url);
        add.append("alt", file.name.replace(/\.[^.]+$/, ""));
        await addRoomImage(add);
      }
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("roomId", roomId);
    await deleteRoomImage(fd);
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-brand/10 bg-cream-deep">
            <Image src={img.url} alt={img.alt ?? ""} fill sizes="160px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(img.id)}
              className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-orange-dark opacity-0 transition group-hover:opacity-100"
            >
              Remove
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-brand/25 text-center text-xs text-muted hover:border-brand hover:bg-brand-light/40">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
            disabled={busy}
          />
          {busy ? "Uploading…" : (
            <>
              <span className="text-2xl leading-none">+</span>
              <span className="mt-1">Add photos</span>
            </>
          )}
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-orange-dark">{error}</p>}
      <p className="mt-2 text-xs text-muted">JPG, PNG, WebP up to 8MB. The first photo is used as the cover.</p>
    </div>
  );
}
