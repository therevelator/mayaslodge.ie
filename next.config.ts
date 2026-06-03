import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile higher up the
  // tree was otherwise being picked up).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Serve images as-is. Keeps SVG placeholders and owner-uploaded photos
    // working without a separate optimizer, which is plenty for a small site.
    unoptimized: true,
  },
};

export default nextConfig;
