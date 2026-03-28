import { OrderValidator, ValidationResult } from './OrderValidator';
import { Order } from '../../entities/Order';

export class ComplianceValidator extends OrderValidator {
  private readonly maxOrdersPerUser: number;
  private activeOrderCount: number;

  constructor(maxOrdersPerUser = 50) {
    super();
    this.maxOrdersPerUser = maxOrdersPerUser;
    this.activeOrderCount = 0;
  }

  setActiveOrderCount(count: number): void {
    this.activeOrderCount = count;
  }

  protected doValidate(order: Order): ValidationResult {
    if (this.activeOrderCount >= this.maxOrdersPerUser) {
      return {
        isValid: false,
        error: `Maximum active orders (${this.maxOrdersPerUser}) reached`,
      };
    }

    const value = Number(order.quantityKwh) * Number(order.pricePerKwh);
    if (value > 50000) {
      return { isValid: false, error: 'Order value exceeds maximum allowed (50,000)' };
    }

    return { isValid: true };
  }
}
