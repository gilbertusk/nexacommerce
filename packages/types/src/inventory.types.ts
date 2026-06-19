export interface Inventory {
  id: string;
  productId: string;
  sku?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  warehouseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
  RESERVE = 'RESERVE',
  CONFIRM = 'CONFIRM',
  RELEASE = 'RELEASE',
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  type: StockMovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
  createdAt: Date;
}

export interface LowStockAlert {
  productId: string;
  sku?: string;
  availableStock: number;
  lowStockThreshold: number;
}
