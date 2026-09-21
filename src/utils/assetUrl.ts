/**
 * Asset URL resolver referencing official in-game textures from TinyTank800/MinecraftAllImages
 * for vanilla Minecraft items and blocks.
 */

// ponytail: newest-first tier list; bump/append when the texture repo publishes a newer folder.
// Full chain covers all but exotic NBT-variant items (e.g. suspicious_stew), which get the badge.
const BASES = [
  'https://raw.githubusercontent.com/TinyTank800/MinecraftAllImages/main/public/images-v2/26.2',
  'https://raw.githubusercontent.com/TinyTank800/MinecraftAllImages/main/public/images-v2/1.21.1',
  'https://raw.githubusercontent.com/TinyTank800/MinecraftAllImages/main/public/images/1.20.6',
];

const clean = (itemId: string) => itemId.replace(/^minecraft:/, '').toLowerCase();

export function getItemImageCandidates(itemId: string): string[] {
  const c = clean(itemId);
  return BASES.map((b) => `${b}/${c}.png`);
}
