import { GridZone } from '../../entities/GridZone';

export interface IPricingStrategy {
  readonly name: string;
  calculatePrice(zone: GridZone, supply: number, demand: number): number;
}
