// ===== User Roles =====
export enum UserRole {
  PROSUMER = 'PROSUMER',
  CONSUMER = 'CONSUMER',
  GRID_OPERATOR = 'GRID_OPERATOR',
  ADMIN = 'ADMIN',
}

// ===== Energy Source Types =====
export enum EnergySourceType {
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  BATTERY = 'BATTERY',
  HYDRO = 'HYDRO',
}

// ===== Meter Status =====
export enum MeterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

// ===== Order =====
export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  MATCHED = 'MATCHED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

// ===== Trade =====
export enum TradeStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  SETTLED = 'SETTLED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

// ===== Settlement =====
export enum SettlementStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ===== Escrow =====
export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

// ===== Grid Zone =====
export enum ZoneStatus {
  ACTIVE = 'ACTIVE',
  HALTED = 'HALTED',
  MAINTENANCE = 'MAINTENANCE',
}

// ===== Notification =====
export enum NotificationType {
  TRADE_MATCHED = 'TRADE_MATCHED',
  TRADE_SETTLED = 'TRADE_SETTLED',
  PRICE_ALERT = 'PRICE_ALERT',
  GRID_ALERT = 'GRID_ALERT',
  SYSTEM = 'SYSTEM',
}

// ===== Price Alert =====
export enum AlertDirection {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

// ===== Community Member Role =====
export enum CommunityRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

// ===== Source type filter for orders (includes ANY) =====
export enum SourceTypeFilter {
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  BATTERY = 'BATTERY',
  HYDRO = 'HYDRO',
  ANY = 'ANY',
}
