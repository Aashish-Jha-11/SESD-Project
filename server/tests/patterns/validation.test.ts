import 'reflect-metadata';
import { QuantityValidator } from '../../src/patterns/validation/QuantityValidator';
import { PriceRangeValidator } from '../../src/patterns/validation/PriceRangeValidator';
import { Order } from '../../src/entities/Order';
import { OrderType, OrderStatus, SourceTypeFilter } from '../../src/enums';

function createOrder(overrides: Partial<Order> = {}): Order {
  const order = new Order();
  order.id = 'order-1';
  order.userId = 'user-1';
  order.type = OrderType.BUY;
  order.quantityKwh = 10;
  order.pricePerKwh = 5.0;
  order.status = OrderStatus.ACTIVE;
  order.gridZoneId = 'zone-1';
  order.sourceType = SourceTypeFilter.ANY;
  order.timeWindowStart = new Date('2025-01-01T06:00:00');
  order.timeWindowEnd = new Date('2025-01-01T18:00:00');
  Object.assign(order, overrides);
  return order;
}

describe('QuantityValidator', () => {
  const validator = new QuantityValidator(0.1, 10000);

  it('should pass for valid quantity', () => {
    const order = createOrder({ quantityKwh: 50 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(true);
  });

  it('should fail for quantity below minimum', () => {
    const order = createOrder({ quantityKwh: 0.01 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 0.1');
  });

  it('should fail for quantity above maximum', () => {
    const order = createOrder({ quantityKwh: 20000 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed 10000');
  });

  it('should pass for boundary values', () => {
    const minOrder = createOrder({ quantityKwh: 0.1 });
    expect(validator.validate(minOrder).isValid).toBe(true);

    const maxOrder = createOrder({ quantityKwh: 10000 });
    expect(validator.validate(maxOrder).isValid).toBe(true);
  });
});

describe('PriceRangeValidator', () => {
  const validator = new PriceRangeValidator(0.01, 100);

  it('should pass for valid price', () => {
    const order = createOrder({ pricePerKwh: 5.0 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(true);
  });

  it('should fail for price below minimum', () => {
    const order = createOrder({ pricePerKwh: 0.001 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 0.01');
  });

  it('should fail for price above maximum', () => {
    const order = createOrder({ pricePerKwh: 200 });
    const result = validator.validate(order);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed 100');
  });
});

describe('Validation Chain (Chain of Responsibility)', () => {
  it('should chain validators together', () => {
    const quantityValidator = new QuantityValidator();
    const priceValidator = new PriceRangeValidator();
    quantityValidator.setNext(priceValidator);

    const validOrder = createOrder({ quantityKwh: 10, pricePerKwh: 5.0 });
    expect(quantityValidator.validate(validOrder).isValid).toBe(true);
  });

  it('should fail at first invalid step', () => {
    const quantityValidator = new QuantityValidator();
    const priceValidator = new PriceRangeValidator();
    quantityValidator.setNext(priceValidator);

    const badQuantity = createOrder({ quantityKwh: 0.001, pricePerKwh: 5.0 });
    const result = quantityValidator.validate(badQuantity);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should propagate to second validator when first passes', () => {
    const quantityValidator = new QuantityValidator();
    const priceValidator = new PriceRangeValidator();
    quantityValidator.setNext(priceValidator);

    const badPrice = createOrder({ quantityKwh: 10, pricePerKwh: 500 });
    const result = quantityValidator.validate(badPrice);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cannot exceed 100');
  });
});
