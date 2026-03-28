import { OrderValidator, ValidationResult } from './OrderValidator';
import { Order } from '../../entities/Order';

export class TimeWindowValidator extends OrderValidator {
  protected doValidate(order: Order): ValidationResult {
    const start = new Date(order.timeWindowStart);
    const end = new Date(order.timeWindowEnd);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid time window dates' };
    }
    if (end <= start) {
      return { isValid: false, error: 'Time window end must be after start' };
    }
    if (end <= now) {
      return { isValid: false, error: 'Time window has already expired' };
    }
    return { isValid: true };
  }
}
