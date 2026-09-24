import assert from 'node:assert';
import { recipesData } from '../src/data/recipes';
import { dedupeByOutput } from '../src/utils/catalog';

// synthetic: three patterns for one output collapse to one card
const r = (id: string, item: string) => ({ id, output: { item, count: 1 } });
const synth = dedupeByOutput([
  r('a', 'wooden_spear'),
  r('b', 'wooden_spear'),
  r('c', 'wooden_spear'),
  r('d', 'stick'),
] as never[]);
assert.strictEqual(synth.length, 2, `expected 2 cards, got ${synth.length}`);
assert.strictEqual(synth[0].id, 'a', 'keeps first pattern');

// real data: catalog shows every output exactly once
const deduped = dedupeByOutput(recipesData);
const outputs = deduped.map((x) => x.output.item);
assert.strictEqual(new Set(outputs).size, outputs.length, 'catalog has duplicate output cards');
assert.strictEqual(
  deduped.filter((x) => x.output.item === 'wooden_spear').length,
  1,
  'Wooden Spear must appear exactly once'
);

// variants stay in recipesData for the workstation switcher
assert.ok(
  recipesData.filter((x) => x.output.item === 'wooden_spear').length > 1,
  'workstation variants must not be deleted'
);

console.log(`ok — ${deduped.length} unique cards from ${recipesData.length} recipes`);
