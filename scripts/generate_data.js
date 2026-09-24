import fs from 'fs';
import path from 'path';
import https from 'https';

// ponytail: single source for game version + categories; everything downstream derives from these
const MC_VERSION = '26.1';
const CATEGORIES = [
  { id: 'all', name: 'All Recipes' },
  { id: 'trials', name: '1.20 / 1.21 / 26.x' },
  { id: 'tools', name: 'Tools' },
  { id: 'combat', name: 'Combat & Armor' },
  { id: 'redstone', name: 'Redstone & Tech' },
  { id: 'building', name: 'Building & Blocks' },
  { id: 'food', name: 'Food & Farming' },
  { id: 'utility', name: 'Utility & Stations' },
  { id: 'decoration', name: 'Decoration' },
];

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
        return;
      }
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

function formatName(rawName) {
  return rawName
    .replace(/^minecraft:/, '')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function determineCategory(itemId, displayName) {
  const id = itemId.toLowerCase();
  
  if (
    id.includes('mace') ||
    id.includes('breeze') ||
    id.includes('trial') ||
    id.includes('heavy_core') ||
    id.includes('crafter') ||
    id.includes('wind_charge') ||
    id.includes('vault') ||
    id.includes('scute')
  ) {
    return 'trials';
  }
  
  if (
    id.includes('sword') ||
    id.includes('bow') ||
    id.includes('shield') ||
    id.includes('helmet') ||
    id.includes('chestplate') ||
    id.includes('leggings') ||
    id.includes('boots') ||
    id.includes('arrow') ||
    id.includes('trident') ||
    id.includes('spear') ||
    id.includes('wolf_armor')
  ) {
    return 'combat';
  }

  if (
    id.includes('pickaxe') ||
    id.includes('axe') ||
    id.includes('shovel') ||
    id.includes('hoe') ||
    id.includes('shears') ||
    id.includes('fishing_rod') ||
    id.includes('brush') ||
    id.includes('flint_and_steel') ||
    id.includes('compass') ||
    id.includes('clock') ||
    id.includes('spyglass')
  ) {
    return 'tools';
  }

  if (
    id.includes('redstone') ||
    id.includes('piston') ||
    id.includes('observer') ||
    id.includes('repeater') ||
    id.includes('comparator') ||
    id.includes('dispenser') ||
    id.includes('dropper') ||
    id.includes('hopper') ||
    id.includes('target') ||
    id.includes('tnt') ||
    id.includes('detector') ||
    id.includes('lever') ||
    id.includes('button') ||
    id.includes('pressure_plate') ||
    id.includes('sensor') ||
    id.includes('lightning_rod')
  ) {
    return 'redstone';
  }

  if (
    id.includes('bread') ||
    id.includes('cake') ||
    id.includes('cookie') ||
    id.includes('pie') ||
    id.includes('stew') ||
    id.includes('soup') ||
    id.includes('apple') ||
    id.includes('golden') ||
    id.includes('carrot') ||
    id.includes('potato') ||
    id.includes('cooked')
  ) {
    return 'food';
  }

  if (
    id.includes('table') ||
    id.includes('furnace') ||
    id.includes('smoker') ||
    id.includes('anvil') ||
    id.includes('chest') ||
    id.includes('barrel') ||
    id.includes('shulker') ||
    id.includes('beacon') ||
    id.includes('conduit') ||
    id.includes('brewing') ||
    id.includes('cauldron') ||
    id.includes('stand') ||
    id.includes('campfire') ||
    id.includes('bed') ||
    id.includes('clock') ||
    id.includes('ladder')
  ) {
    return 'utility';
  }

  if (
    id.includes('banner') ||
    id.includes('painting') ||
    id.includes('flower') ||
    id.includes('pot') ||
    id.includes('carpet') ||
    id.includes('candle') ||
    id.includes('glass') ||
    id.includes('sign') ||
    id.includes('head') ||
    id.includes('skull')
  ) {
    return 'decoration';
  }

  if (
    id.includes('planks') ||
    id.includes('brick') ||
    id.includes('stone') ||
    id.includes('cobblestone') ||
    id.includes('copper') ||
    id.includes('tuff') ||
    id.includes('deepslate') ||
    id.includes('quartz') ||
    id.includes('slab') ||
    id.includes('stairs') ||
    id.includes('wall') ||
    id.includes('fence') ||
    id.includes('block') ||
    id.includes('log') ||
    id.includes('wood') ||
    id.includes('prismarine') ||
    id.includes('purpur') ||
    id.includes('terracotta') ||
    id.includes('concrete')
  ) {
    return 'building';
  }

  return 'utility';
}

function determineVersion(itemId) {
  const id = itemId.toLowerCase();
  // ponytail: keyword heuristic, not exact — re-check when bumping MC_VERSION
  if (
    id.includes('spear') ||
    (id.includes('copper') && /(sword|axe|pickaxe|shovel|hoe|helmet|chestplate|leggings|boots|nugget|chain|lantern|bars|trapdoor)/.test(id))
  ) {
    return '26.1';
  }
  if (
    id.includes('mace') ||
    id.includes('crafter') ||
    id.includes('breeze') ||
    id.includes('heavy_core') ||
    id.includes('trial') ||
    id.includes('scute') ||
    id.includes('wolf_armor') ||
    id.includes('tuff') ||
    id.includes('copper_door') ||
    id.includes('copper_grate') ||
    id.includes('chiseled_copper') ||
    id.includes('vault')
  ) {
    return '1.21';
  }
  if (
    id.includes('cherry') ||
    id.includes('bamboo') ||
    id.includes('chiseled_bookshelf') ||
    id.includes('camel') ||
    id.includes('sniffer') ||
    id.includes('pottery') ||
    id.includes('trim') ||
    id.includes('hanging_sign')
  ) {
    return '1.20';
  }
  return '1.20+ Vanilla';
}

// Prismarine crafting data has no smithing-table recipes; synthesize netherite gear entries
const SMITHING_GEAR = [
  ['netherite_sword', 'diamond_sword', 'combat'],
  ['netherite_shovel', 'diamond_shovel', 'tools'],
  ['netherite_pickaxe', 'diamond_pickaxe', 'tools'],
  ['netherite_axe', 'diamond_axe', 'tools'],
  ['netherite_hoe', 'diamond_hoe', 'tools'],
  ['netherite_helmet', 'diamond_helmet', 'combat'],
  ['netherite_chestplate', 'diamond_chestplate', 'combat'],
  ['netherite_leggings', 'diamond_leggings', 'combat'],
  ['netherite_boots', 'diamond_boots', 'combat'],
  ['netherite_spear', 'diamond_spear', 'combat'],
];

function buildSmithingRecipes(items) {
  const itemByName = Object.fromEntries(items.map((i) => [i.name, i]));
  return SMITHING_GEAR.flatMap(([outId, baseId, category]) => {
    const out = itemByName[outId];
    if (!out) return [];
    const name = out.displayName || formatName(outId);
    const baseName = itemByName[baseId]?.displayName || formatName(baseId);
    const templateName =
      itemByName.netherite_upgrade_smithing_template?.displayName || formatName('netherite_upgrade_smithing_template');
    const ingotName = itemByName.netherite_ingot?.displayName || formatName('netherite_ingot');
    return [
      {
        id: outId,
        name,
        category,
        // center row = smithing slots: template | base | addition
        grid: [null, null, null, 'netherite_upgrade_smithing_template', baseId, 'netherite_ingot', null, null, null],
        output: { item: outId, count: 1 },
        shapeless: false,
        station: 'smithing',
        description: `Smiths 1x ${name} from ${baseName} using ${templateName} and ${ingotName}.`,
        version: determineVersion(outId),
        searchKeywords: [outId, name.toLowerCase(), baseName.toLowerCase(), 'netherite', 'smithing', category],
        giveCommand: `/give @p minecraft:${outId} 1`,
      },
    ];
  });
}

function alignInShapeToGrid(inShape, itemById) {
  // 3x3 grid initialization with null
  const grid = [null, null, null, null, null, null, null, null, null];
  if (!inShape || !Array.isArray(inShape)) return grid;

  const numRows = Math.min(inShape.length, 3);
  for (let r = 0; r < numRows; r++) {
    const row = inShape[r];
    if (!Array.isArray(row)) continue;
    const numCols = Math.min(row.length, 3);
    for (let c = 0; c < numCols; c++) {
      const val = row[c];
      if (val !== null && val !== undefined) {
        const itemObj = itemById[val];
        if (itemObj) {
          grid[r * 3 + c] = itemObj.name;
        }
      }
    }
  }
  return grid;
}

function alignIngredientsToGrid(ingredients, itemById) {
  const grid = [null, null, null, null, null, null, null, null, null];
  if (!ingredients || !Array.isArray(ingredients)) return grid;

  for (let i = 0; i < Math.min(ingredients.length, 9); i++) {
    const val = ingredients[i];
    if (val !== null && val !== undefined) {
      const itemObj = itemById[val];
      if (itemObj) {
        grid[i] = itemObj.name;
      }
    }
  }
  return grid;
}

async function main() {
  console.log(`Fetching official Minecraft ${MC_VERSION} items & recipes data...`);
  const [items, recipesMap] = await Promise.all([
    fetchJson(`https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc/${MC_VERSION}/items.json`),
    fetchJson(`https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc/${MC_VERSION}/recipes.json`),
  ]);

  const itemById = {};
  items.forEach((i) => (itemById[i.id] = i));

  const processedRecipes = [];
  const processedMaterials = {};

  // Build materials map for all items (id + display name only — the only fields the UI reads)
  items.forEach((item) => {
    processedMaterials[item.name] = {
      id: item.name,
      name: item.displayName || formatName(item.name),
    };
  });

  // Process recipes
  for (const [outputIdStr, recipeList] of Object.entries(recipesMap)) {
    const outputItem = itemById[outputIdStr];
    if (!outputItem) continue;

    recipeList.forEach((rawRecipe, idx) => {
      let grid = [null, null, null, null, null, null, null, null, null];
      let shapeless = false;

      if (rawRecipe.inShape) {
        grid = alignInShapeToGrid(rawRecipe.inShape, itemById);
        shapeless = false;
      } else if (rawRecipe.ingredients) {
        grid = alignIngredientsToGrid(rawRecipe.ingredients, itemById);
        shapeless = true;
      }

      // Check if grid has at least one ingredient
      const hasIngredient = grid.some((g) => g !== null);
      if (!hasIngredient) return;

      const outputCount = rawRecipe.result ? rawRecipe.result.count : 1;
      const category = determineCategory(outputItem.name, outputItem.displayName);
      const version = determineVersion(outputItem.name);
      const recipeId = idx === 0 ? outputItem.name : `${outputItem.name}_variant_${idx + 1}`;

      const ingredientsList = Array.from(new Set(grid.filter(Boolean))).map((ing) =>
        itemById[ing] ? itemById[ing].displayName || formatName(ing) : formatName(ing)
      );

      processedRecipes.push({
        id: recipeId,
        name: outputItem.displayName || formatName(outputItem.name),
        category,
        grid,
        output: {
          item: outputItem.name,
          count: outputCount,
        },
        shapeless,
        description: `Crafts ${outputCount}x ${outputItem.displayName || formatName(outputItem.name)} using ${ingredientsList.join(', ')}.`,
        version,
        searchKeywords: [
          outputItem.name,
          outputItem.displayName ? outputItem.displayName.toLowerCase() : '',
          ...ingredientsList.map((i) => i.toLowerCase()),
          category,
        ].filter(Boolean),
        giveCommand: `/give @p minecraft:${outputItem.name} ${outputCount}`,
      });
    });
  }

  console.log(`Generated ${processedRecipes.length} recipes across ${Object.keys(processedMaterials).length} items.`);

  const existingIds = new Set(processedRecipes.map((r) => r.id));
  const smithingRecipes = buildSmithingRecipes(items);
  for (const r of smithingRecipes) {
    if (!existingIds.has(r.id)) {
      processedRecipes.push(r);
      existingIds.add(r.id);
    }
  }
  console.log(`Added ${smithingRecipes.length} smithing-table recipes.`);
  if (smithingRecipes.length !== SMITHING_GEAR.length) throw new Error('missing smithing gear items in dataset');

  // Write materials.ts
  const materialsContent = `/**
 * Official Minecraft ${MC_VERSION} Item Dataset
 * Auto-generated from official Minecraft game definitions. Do not edit by hand — rerun scripts/generate_data.js.
 */

import { ItemInfo } from '../types';

export const itemsMap: Record<string, ItemInfo> = ${JSON.stringify(processedMaterials, null, 2)};
`;

  // Write recipes.ts
  const recipesContent = `/**
 * Official Minecraft ${MC_VERSION} 3x3 Crafting Recipe Database
 * Contains ${processedRecipes.length} recipes.
 * Auto-generated — do not edit by hand, rerun scripts/generate_data.js.
 */

import { Recipe, CategoryInfo } from '../types';

export const categories: CategoryInfo[] = ${JSON.stringify(CATEGORIES, null, 2)};

export const recipesData: Recipe[] = ${JSON.stringify(processedRecipes, null, 2)};
`;

  fs.writeFileSync(path.join(process.cwd(), 'src/data/materials.ts'), materialsContent, 'utf-8');
  fs.writeFileSync(path.join(process.cwd(), 'src/data/recipes.ts'), recipesContent, 'utf-8');

  console.log('Successfully written src/data/materials.ts and src/data/recipes.ts!');
}

main().catch((err) => {
  console.error('Error generating data:', err);
  process.exit(1);
});
