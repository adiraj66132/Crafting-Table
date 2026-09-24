/**
 * Asset URL resolver referencing official in-game textures from TinyTank800/MinecraftAllImages
 * for vanilla Minecraft items and blocks.
 */

// ponytail: newest-first tier list; bump/append when the texture repo publishes a newer folder.
// Measured 2026-09: jsDelivr serves max-age=604800 vs raw's max-age=300, and jsDelivr 404s are
// no-store ~1.7s — so only two jsDelivr tiers lead, raw backs those up (covers jsDelivr's 12h
// @main purge lag). Old images/1.21.4|1.20.6|1.19.4 folders measured ~0% hit; removed.
const BASES = [
  'https://cdn.jsdelivr.net/gh/TinyTank800/MinecraftAllImages@main/public/images-v2/26.2',
  'https://cdn.jsdelivr.net/gh/TinyTank800/MinecraftAllImages@main/public/images-v2/1.21.1',
  'https://raw.githubusercontent.com/TinyTank800/MinecraftAllImages/main/public/images-v2/26.2',
  'https://raw.githubusercontent.com/TinyTank800/MinecraftAllImages/main/public/images-v2/1.21.1',
];

const clean = (itemId: string) => itemId.replace(/^minecraft:/, '').toLowerCase();

export function getItemImageCandidates(itemId: string): string[] {
  const c = clean(itemId);
  return BASES.map((b) => `${b}/${c}.png`);
}
