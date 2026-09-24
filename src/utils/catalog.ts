import { Recipe } from '../types';

/**
 * One catalog card per output item. Alternate crafting patterns for the same
 * item (recipe `_variant_N` entries) stay reachable via the workstation
 * variant switcher, which reads the full undeduped recipesData.
 */
export function dedupeByOutput(recipes: Recipe[]): Recipe[] {
  const seen = new Set<string>();
  return recipes.filter((recipe) => {
    if (seen.has(recipe.output.item)) return false;
    seen.add(recipe.output.item);
    return true;
  });
}
