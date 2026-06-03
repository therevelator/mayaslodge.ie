// Generates branded SVG placeholder images for the rooms.
// These are clearly placeholders — the owner replaces them with real photos
// via the admin panel. Run with: node scripts/gen-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/rooms");
mkdirSync(outDir, { recursive: true });

// name -> [from, to] gradient colours (warm, Irish-leaning palette)
const rooms = {
  shamrock: ["#2f8f46", "#1c5e2e"],
  claddagh: ["#3a7d6c", "#234f45"],
  connemara: ["#2c7da0", "#1b4965"],
  liffey: ["#6a8f3c", "#41611f"],
  aran: ["#c98a2b", "#9c6516"],
  burren: ["#7a6cae", "#4b3f7a"],
};

const shamrock = (cx, cy, s, fill, opacity) => {
  // four hearts arranged as a clover, drawn with simple paths
  const heart = (rot) =>
    `<path transform="translate(${cx} ${cy}) rotate(${rot}) translate(0 ${-s * 0.18})" d="M0 ${s * 0.32} C ${-s * 0.55} ${-s * 0.05}, ${-s * 0.18} ${-s * 0.5}, 0 ${-s * 0.18} C ${s * 0.18} ${-s * 0.5}, ${s * 0.55} ${-s * 0.05}, 0 ${s * 0.32} Z" fill="${fill}" opacity="${opacity}"/>`;
  return [0, 90, 180, 270].map(heart).join("");
};

for (const [name, [from, to]] of Object.entries(rooms)) {
  for (const variant of ["", "-2"]) {
    const w = 1200;
    const h = 800;
    const dim = variant ? 0.9 : 1;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g opacity="${0.12 * dim}">
    ${shamrock(w * 0.78, h * 0.32, 360, "#ffffff", 1)}
    ${shamrock(w * 0.18, h * 0.78, 240, "#ffffff", 1)}
  </g>
  <g transform="translate(${w / 2} ${h / 2 - 40})">
    ${shamrock(0, -60, 150, "#ffffff", 0.92)}
  </g>
  <text x="${w / 2}" y="${h / 2 + 110}" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#ffffff" opacity="0.96">Maya's Lodge</text>
  <text x="${w / 2}" y="${h / 2 + 160}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#ffffff" opacity="0.7" letter-spacing="3">PHOTO COMING SOON</text>
</svg>`;
    writeFileSync(resolve(outDir, `${name}${variant}.svg`), svg.trim());
  }
}

console.log("Placeholder images written to public/rooms/");
