export interface ItemInfo {
  id: string; // e.g. "diamond_sword"
  name: string; // e.g. "Diamond Sword"
}

export interface RecipeOutput {
  item: string; // matches item id
  count: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  grid: (string | null)[]; // 9 slots, row-major
  output: RecipeOutput;
  shapeless: boolean;
  station?: 'smithing';
  description: string;
  version: string;
  searchKeywords: string[];
  giveCommand?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
}
