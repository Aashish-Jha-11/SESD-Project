import { OrderValidator, ValidationResult } from './OrderValidator';
import { Order } from '../../entities/Order';

export class PriceRangeValidator extends OrderValidator {
  private readonly minPrice: number;
  private readonly maxPrice: number;

  constructor(minPrice = 0.01, maxPrice = 100) {
    super();
    this.minPrice = minPrice;
    this.maxPrice = maxPrice;
  }

  protected doValidate(order: Order): ValidationResult {
    const price = Number(order.pricePerKwh);
    if (price < this.minPrice) {
      return { isValid: false, error: `Price must be at least ${this.minPrice} per kWh` };
    }
    if (price > this.maxPrice) {
      return { isValid: false, error: `Price cannot exceed ${this.maxPrice} per kWh` };
    }
    return { isValid: true };
  }
}
