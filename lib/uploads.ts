import { getStore } from "@netlify/blobs";

// Owner-uploaded room photos.
// On Netlify they live in a Netlify Blobs store; locally they're plain files in
// public/uploads. Either way the public URL is /uploads/<name>.

const STORE = "uploads";

/** True when running on Netlify (build or functions). */
export function usesBlobStorage(): boolean {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
}

export async function saveUpload(name: string, bytes: Buffer, contentType: string) {
  const store = getStore({ name: STORE, consistency: "strong" });
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  await store.set(name, data, { metadata: { contentType } });
}

export async function readUpload(name: string) {
  const store = getStore({ name: STORE });
  return store.getWithMetadata(name, { type: "arrayBuffer" });
}
