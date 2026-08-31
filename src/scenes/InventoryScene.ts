import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { InventoryManager } from '../objects/InventoryManager';
import type { ItemDef } from '../config/itemConfig';

export class InventoryScene extends Phaser.Scene {
  private inventoryManager!: InventoryManager;
  private onEquipChange!: () => void;

  private itemDetailsContainer!: Phaser.GameObjects.Container;
  private selectedItem: ItemDef | null = null;
  private detailTitle!: Phaser.GameObjects.Text;
  private detailDesc!: Phaser.GameObjects.Text;
  private actionBtnText!: Phaser.GameObjects.Text;
  private actionBtnBg!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'InventoryScene' });
  }

  init(data: { inventoryManager: InventoryManager; onEquipChange: () => void }): void {
    this.inventoryManager = data.inventoryManager;
    this.onEquipChange = data.onEquipChange;
  }

  create(): void {
    // 1. Dimmed backdrop
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.7
    );
    overlay.setInteractive();

    // 2. Main Dialog Frame
    const frame = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 540, 360, 0x0f172a, 0.96);
    frame.setStrokeStyle(2, 0x38bdf8);

    // Title & Close
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, '🎒 INVENTORY & EQUIPMENT', {
      fontSize: '18px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(GAME_WIDTH / 2 + 240, GAME_HEIGHT / 2 - 150, '✕', {
      fontSize: '18px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeInventory());

    // Coins counter
    this.add.image(GAME_WIDTH / 2 - 230, GAME_HEIGHT / 2 - 150, 'icon_coin_gold');
    this.add.text(GAME_WIDTH / 2 - 215, GAME_HEIGHT / 2 - 158, `${this.inventoryManager.getCoins()} Gold`, {
      fontSize: '13px',
      color: '#facc15',
      fontStyle: 'bold'
    });

    // 3. Render Equipment Slots (Left Column)
    this.renderEquipmentSection(GAME_WIDTH / 2 - 240, GAME_HEIGHT / 2 - 110);

    // 4. Render Inventory Grid (Right Column)
    this.renderInventoryGrid(GAME_WIDTH / 2 - 40, GAME_HEIGHT / 2 - 110);

    // 5. Item Detail Panel (Bottom)
    this.renderDetailsPanel(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 105);

    // Key shortcut to close
    this.input.keyboard?.on('keydown-I', () => this.closeInventory());
    this.input.keyboard?.on('keydown-ESC', () => this.closeInventory());
  }

  private renderEquipmentSection(startX: number, startY: number): void {
    const eq = this.inventoryManager.getEquipment();

    this.add.text(startX + 80, startY, 'EQUIPPED', {
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Weapon Slot
    const wSlotBg = this.add.rectangle(startX + 80, startY + 50, 160, 48, 0x1e293b);
    wSlotBg.setStrokeStyle(1.5, 0x38bdf8);
    wSlotBg.setInteractive({ useHandCursor: true });
    this.add.image(startX + 28, startY + 50, eq.weapon.textureKey);
    this.add.text(startX + 50, startY + 42, `${eq.weapon.name}\n[${eq.weapon.attackMode?.toUpperCase()}]`, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    wSlotBg.on('pointerdown', () => this.showItemDetails(eq.weapon, false));

    // Armor Slot
    const aSlotBg = this.add.rectangle(startX + 80, startY + 110, 160, 48, 0x1e293b);
    aSlotBg.setStrokeStyle(1.5, eq.armor ? 0xa855f7 : 0x475569);
    aSlotBg.setInteractive({ useHandCursor: true });

    if (eq.armor) {
      this.add.image(startX + 28, startY + 110, eq.armor.textureKey);
      this.add.text(startX + 50, startY + 102, `${eq.armor.name}\n+${eq.armor.defenseBonus} DEF`, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      aSlotBg.on('pointerdown', () => this.showItemDetails(eq.armor!, false, true));
    } else {
      this.add.text(startX + 80, startY + 110, '(No Armor)', {
        fontSize: '11px',
        color: '#64748b'
      }).setOrigin(0.5);
    }
  }

  private renderInventoryGrid(startX: number, startY: number): void {
    this.add.text(startX + 130, startY, 'BAG (MAX 16)', {
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    const slots = this.inventoryManager.getSlots();
    const cols = 4;
    const rows = 3;
    const slotSize = 48;
    const gap = 12;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const x = startX + 24 + c * (slotSize + gap);
        const y = startY + 45 + r * (slotSize + gap);

        const slotBg = this.add.rectangle(x, y, slotSize, slotSize, 0x1e293b);
        slotBg.setStrokeStyle(1, 0x334155);

        if (idx < slots.length) {
          const slot = slots[idx];
          slotBg.setStrokeStyle(1.5, 0x38bdf8);
          slotBg.setInteractive({ useHandCursor: true });

          const icon = this.add.image(x, y, slot.item.textureKey);
          icon.setScale(1.2);

          if (slot.quantity > 1) {
            this.add.text(x + 16, y + 10, `${slot.quantity}`, {
              fontSize: '10px',
              color: '#facc15',
              fontStyle: 'bold'
            }).setOrigin(1, 1);
          }

          slotBg.on('pointerdown', () => this.showItemDetails(slot.item, true));
        }
      }
    }
  }

  private renderDetailsPanel(x: number, y: number): void {
    this.itemDetailsContainer = this.add.container(x, y);

    const panelBg = this.add.rectangle(0, 0, 500, 80, 0x1e293b, 0.9);
    panelBg.setStrokeStyle(1, 0x475569);

    this.detailTitle = this.add.text(-230, -28, 'Select an item to view info or equip', {
      fontSize: '13px',
      color: '#e2e8f0',
      fontStyle: 'bold'
    });

    this.detailDesc = this.add.text(-230, -8, '', {
      fontSize: '11px',
      color: '#94a3b8',
      wordWrap: { width: 330 }
    });

    // Action button
    this.actionBtnBg = this.add.rectangle(180, 0, 100, 32, 0x0284c7);
    this.actionBtnBg.setStrokeStyle(1, 0xffffff, 0.3);
    this.actionBtnBg.setInteractive({ useHandCursor: true });
    this.actionBtnBg.setVisible(false);

    this.actionBtnText = this.add.text(180, 0, 'USE', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.actionBtnText.setVisible(false);

    this.actionBtnBg.on('pointerdown', () => this.executeItemAction());

    this.itemDetailsContainer.add([
      panelBg,
      this.detailTitle,
      this.detailDesc,
      this.actionBtnBg,
      this.actionBtnText
    ]);
  }

  private showItemDetails(item: ItemDef, isFromBag: boolean, isEquippedArmor = false): void {
    this.selectedItem = item;
    this.detailTitle.setText(item.name);
    this.detailDesc.setText(item.description);

    this.actionBtnBg.setVisible(true);
    this.actionBtnText.setVisible(true);

    if (isFromBag) {
      if (item.type === 'weapon' || item.type === 'armor') {
        this.actionBtnText.setText('EQUIP');
        this.actionBtnBg.setFillStyle(0x0284c7);
      } else if (item.type === 'consumable') {
        this.actionBtnText.setText('CONSUME');
        this.actionBtnBg.setFillStyle(0x16a34a);
      } else {
        this.actionBtnBg.setVisible(false);
        this.actionBtnText.setVisible(false);
      }
    } else {
      if (isEquippedArmor) {
        this.actionBtnText.setText('UNEQUIP');
        this.actionBtnBg.setFillStyle(0xd97706);
      } else {
        this.actionBtnBg.setVisible(false);
        this.actionBtnText.setVisible(false);
      }
    }
  }

  private executeItemAction(): void {
    if (!this.selectedItem) return;

    if (this.selectedItem.type === 'weapon' || this.selectedItem.type === 'armor') {
      if (this.actionBtnText.text === 'UNEQUIP') {
        this.inventoryManager.unequipArmor();
      } else {
        this.inventoryManager.equipItem(this.selectedItem);
      }
      this.onEquipChange();
      this.refreshScene();
    } else if (this.selectedItem.type === 'consumable') {
      const heal = this.inventoryManager.usePotion();
      if (heal > 0) {
        this.events.emit('use_potion', heal);
      }
      this.refreshScene();
    }
  }

  private refreshScene(): void {
    this.scene.restart({
      inventoryManager: this.inventoryManager,
      onEquipChange: this.onEquipChange
    });
  }

  private closeInventory(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
  }
}
