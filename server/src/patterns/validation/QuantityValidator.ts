import { OrderValidator, ValidationResult } from './OrderValidator';
import { Order } from '../../entities/Order';

export class QuantityValidator extends OrderValidator {
  private readonly minQuantity: number;
  private readonly maxQuantity: number;

  constructor(minQuantity = 0.1, maxQuantity = 10000) {
    super();
    this.minQuantity = minQuantity;
    this.maxQuantity = maxQuantity;
  }

  protected doValidate(order: Order): ValidationResult {
    const qty = Number(order.quantityKwh);
    if (qty < this.minQuantity) {
      return { isValid: false, error: `Quantity must be at least ${this.minQuantity} kWh` };
    }
    if (qty > this.maxQuantity) {
      return { isValid: false, error: `Quantity cannot exceed ${this.maxQuantity} kWh` };
    }
    return { isValid: true };
  }
}
