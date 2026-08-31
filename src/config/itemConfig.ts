export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material';
export type AttackMode = 'melee' | 'ranged';

export interface ItemDef {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  textureKey: string;
  price: number;
  attackMode?: AttackMode;
  damageBonus?: number;
  defenseBonus?: number;
  healAmount?: number;
  projectileSpeed?: number;
  attackCooldownMs?: number;
}

export interface InventorySlot {
  item: ItemDef;
  quantity: number;
}

export interface EquipmentState {
  weapon: ItemDef;
  armor: ItemDef | null;
}

export interface SaveData {
  version: number;
  timestamp: number;
  player: {
    hp: number;
    maxHp: number;
    score: number;
    coins: number;
    distance: number;
    kills: number;
    equippedWeaponId: string;
    equippedArmorId: string | null;
  };
  inventory: Array<{
    itemId: string;
    quantity: number;
  }>;
}

export const ITEM_DATABASE: Record<string, ItemDef> = {
  sword_iron: {
    id: 'sword_iron',
    name: 'Iron Broadsword',
    type: 'weapon',
    description: 'A standard steel blade. Fast melee strikes with combo capability.',
    textureKey: 'icon_sword_iron',
    price: 50,
    attackMode: 'melee',
    damageBonus: 0,
    attackCooldownMs: 250
  },
  sword_flame: {
    id: 'sword_flame',
    name: 'Flame Greatsword',
    type: 'weapon',
    description: 'Imbued with hellfire. Deals +20 bonus melee damage.',
    textureKey: 'icon_sword_flame',
    price: 250,
    attackMode: 'melee',
    damageBonus: 20,
    attackCooldownMs: 280
  },
  bow_hunter: {
    id: 'bow_hunter',
    name: 'Hunter Bow',
    type: 'weapon',
    description: 'Ranged wood bow. Fires piercing arrows at high velocity.',
    textureKey: 'icon_bow_hunter',
    price: 120,
    attackMode: 'ranged',
    damageBonus: 10,
    projectileSpeed: 420,
    attackCooldownMs: 380
  },
  staff_arcane: {
    id: 'staff_arcane',
    name: 'Arcane Staff',
    type: 'weapon',
    description: 'Mystic wizard staff. Shoots heavy explosive magical plasma.',
    textureKey: 'icon_staff_arcane',
    price: 300,
    attackMode: 'ranged',
    damageBonus: 25,
    projectileSpeed: 340,
    attackCooldownMs: 450
  },
  armor_leather: {
    id: 'armor_leather',
    name: 'Leather Tunic',
    type: 'armor',
    description: 'Basic hardened leather. Reduces incoming damage by 3.',
    textureKey: 'icon_armor_leather',
    price: 80,
    defenseBonus: 3
  },
  armor_steel: {
    id: 'armor_steel',
    name: 'Knight Plate',
    type: 'armor',
    description: 'Heavy plate armor. Reduces incoming damage by 8.',
    textureKey: 'icon_armor_steel',
    price: 280,
    defenseBonus: 8
  },
  potion_hp: {
    id: 'potion_hp',
    name: 'Health Potion',
    type: 'consumable',
    description: 'Restores +40 HP immediately. Quick-use with key [H].',
    textureKey: 'icon_potion_hp',
    price: 35,
    healAmount: 40
  },
  coin_gold: {
    id: 'coin_gold',
    name: 'Gold Coin',
    type: 'material',
    description: 'Valuable currency dropped by monsters.',
    textureKey: 'icon_coin_gold',
    price: 10
  }
};
