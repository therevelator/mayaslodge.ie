// Browser-side photo shrinking before upload.
//
// Phone photos are often 5–12 MB; the server (a Netlify Function) only accepts
// request bodies up to ~6 MB, and big originals also make room pages slow. We
// scale photos down to at most MAX_SIDE pixels on the long edge and re-encode
// them as WebP (JPEG fallback), which keeps them sharp on any screen at a few
// hundred KB.

const MAX_SIDE = 2000;
const QUALITY = 0.82;
/** Files already this small (and small in pixels) are uploaded as-is. */
const SMALL_ENOUGH = 900 * 1024;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function shrinkImage(file: File): Promise<File> {
  // Keep animated GIFs untouched.
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    // Respect the phone's rotation (EXIF) so photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // The browser can't decode it; let the server decide.
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SMALL_ENOUGH) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", QUALITY);
  let type = "image/webp";
  let ext = "webp";
  if (!blob || blob.type !== "image/webp") {
    // Older Safari can't encode WebP.
    blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);
    type = "image/jpeg";
    ext = "jpg";
  }
  if (!blob || blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.${ext}`, { type, lastModified: Date.now() });
}
