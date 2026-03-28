import { Order } from '../../entities/Order';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export abstract class OrderValidator {
  protected next: OrderValidator | null = null;

  setNext(validator: OrderValidator): OrderValidator {
    this.next = validator;
    return validator;
  }

  validate(order: Order): ValidationResult {
    const result = this.doValidate(order);
    if (!result.isValid) return result;
    if (this.next) return this.next.validate(order);
    return { isValid: true };
  }

  protected abstract doValidate(order: Order): ValidationResult;
}
