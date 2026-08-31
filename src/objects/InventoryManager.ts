import {
  type ItemDef,
  type InventorySlot,
  type EquipmentState,
  type SaveData,
  ITEM_DATABASE
} from '../config/itemConfig';

export const SAVE_STORAGE_KEY = 'phaser_scroller_savedata';

export class InventoryManager {
  private slots: InventorySlot[] = [];
  private coins = 0;
  private equipment: EquipmentState;

  constructor() {
    // Default starter gear
    this.equipment = {
      weapon: ITEM_DATABASE['sword_iron'],
      armor: null
    };

    // Starter items
    this.addItem(ITEM_DATABASE['potion_hp'], 2);
    this.addItem(ITEM_DATABASE['bow_hunter'], 1);
  }

  public getSlots(): InventorySlot[] {
    return this.slots;
  }

  public getCoins(): number {
    return this.coins;
  }

  public getEquipment(): EquipmentState {
    return this.equipment;
  }

  public addCoins(amount: number): void {
    this.coins = Math.max(0, this.coins + amount);
  }

  public addItem(item: ItemDef, quantity = 1): boolean {
    if (item.id === 'coin_gold') {
      this.addCoins(quantity * 10);
      return true;
    }

    const existing = this.slots.find((s) => s.item.id === item.id);
    if (existing) {
      existing.quantity += quantity;
      return true;
    }

    if (this.slots.length >= 16) {
      return false; // Inventory full
    }

    this.slots.push({ item, quantity });
    return true;
  }

  public removeItem(itemId: string, quantity = 1): boolean {
    const idx = this.slots.findIndex((s) => s.item.id === itemId);
    if (idx === -1) return false;

    const slot = this.slots[idx];
    if (slot.quantity > quantity) {
      slot.quantity -= quantity;
    } else {
      this.slots.splice(idx, 1);
    }
    return true;
  }

  public equipItem(item: ItemDef): boolean {
    if (item.type === 'weapon') {
      // Put old weapon back to inventory
      const oldWeapon = this.equipment.weapon;
      this.removeItem(item.id, 1);
      this.equipment.weapon = item;
      if (oldWeapon) {
        this.addItem(oldWeapon, 1);
      }
      return true;
    } else if (item.type === 'armor') {
      const oldArmor = this.equipment.armor;
      this.removeItem(item.id, 1);
      this.equipment.armor = item;
      if (oldArmor) {
        this.addItem(oldArmor, 1);
      }
      return true;
    }
    return false;
  }

  public unequipArmor(): boolean {
    if (!this.equipment.armor) return false;
    const oldArmor = this.equipment.armor;
    this.equipment.armor = null;
    this.addItem(oldArmor, 1);
    return true;
  }

  public usePotion(): number {
    const potionSlot = this.slots.find((s) => s.item.id === 'potion_hp');
    if (!potionSlot || potionSlot.quantity <= 0) {
      return 0;
    }
    const heal = potionSlot.item.healAmount || 40;
    this.removeItem('potion_hp', 1);
    return heal;
  }

  public exportSaveData(extra: {
    hp: number;
    maxHp: number;
    score: number;
    distance: number;
    kills: number;
  }): SaveData {
    return {
      version: 1,
      timestamp: Date.now(),
      player: {
        hp: extra.hp,
        maxHp: extra.maxHp,
        score: extra.score,
        coins: this.coins,
        distance: extra.distance,
        kills: extra.kills,
        equippedWeaponId: this.equipment.weapon.id,
        equippedArmorId: this.equipment.armor ? this.equipment.armor.id : null
      },
      inventory: this.slots.map((s) => ({
        itemId: s.item.id,
        quantity: s.quantity
      }))
    };
  }

  public importSaveData(save: SaveData): void {
    this.coins = save.player.coins || 0;
    const weapon = ITEM_DATABASE[save.player.equippedWeaponId] || ITEM_DATABASE['sword_iron'];
    const armor = save.player.equippedArmorId ? ITEM_DATABASE[save.player.equippedArmorId] || null : null;

    this.equipment = {
      weapon,
      armor
    };

    this.slots = [];
    save.inventory.forEach((inv) => {
      const item = ITEM_DATABASE[inv.itemId];
      if (item) {
        this.slots.push({ item, quantity: inv.quantity });
      }
    });
  }
}

export class SaveLoadManager {
  public static hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  public static saveGame(data: SaveData): boolean {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  public static loadGame(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }

  public static deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
      // Ignored
    }
  }
}
