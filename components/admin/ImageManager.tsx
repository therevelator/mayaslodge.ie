"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { addRoomImage, deleteRoomImage } from "@/app/admin/actions";
import { shrinkImage } from "@/lib/resize-image";

type Img = { id: string; url: string; alt: string | null };

export function ImageManager({
  roomId,
  images,
}: {
  roomId: string;
  images: Img[];
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const list = Array.from(files);
    try {
      for (const [i, original] of list.entries()) {
        setProgress(list.length > 1 ? `Uploading ${i + 1} of ${list.length}…` : "Uploading…");
        // Shrink big phone photos in the browser first (faster upload, faster
        // pages, and under the server's ~6 MB request limit).
        const file = await shrinkImage(original);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        // The server may answer without JSON (e.g. 413 when a file is too big).
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          const why =
            res.status === 413
              ? "is too large to upload, even after resizing. Try a smaller photo."
              : (data.error ?? `could not be uploaded (error ${res.status}).`);
          throw new Error(`"${original.name}" ${why}`);
        }

        const add = new FormData();
        add.append("roomId", roomId);
        add.append("url", data.url);
        add.append("alt", original.name.replace(/\.[^.]+$/, ""));
        await addRoomImage(add);
      }
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("roomId", roomId);
    await deleteRoomImage(fd);
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
          {busy ? (progress ?? "Uploading…") : (
            <>
              <span className="text-2xl leading-none">+</span>
              <span className="mt-1">Add photos</span>
            </>
          )}
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-orange-dark">{error}</p>}
      <p className="mt-2 text-xs text-muted">JPG, PNG or WebP. Large phone photos are resized automatically. The first photo is used as the cover.</p>
    </div>
  );
}
