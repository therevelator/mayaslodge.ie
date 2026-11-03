import { readUpload } from "@/lib/uploads";

// Serves owner-uploaded photos from Netlify Blobs at /uploads/<name>.
// (Locally, files in public/uploads are served directly and never reach here.)

const SAFE_NAME = /^[\w-]+\.(jpg|png|webp|avif|gif)$/;

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!SAFE_NAME.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await readUpload(name);
  if (!blob) {
    return new Response("Not found", { status: 404 });
  }

  const contentType =
    typeof blob.metadata?.contentType === "string" ? blob.metadata.contentType : "application/octet-stream";

  return new Response(blob.data, {
    headers: {
      "Content-Type": contentType,
      // File names are unique per upload, so they can be cached forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
