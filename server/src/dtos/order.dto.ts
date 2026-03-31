import { OrderType, SourceTypeFilter } from '../enums';

export interface CreateOrderDto {
  type: OrderType;
  quantityKwh: number;
  pricePerKwh: number;
  gridZoneId: string;
  sourceType?: SourceTypeFilter;
  timeWindowStart: string;
  timeWindowEnd: string;
}
