import { SchemaTypeOptions } from 'mongoose';

export const PriceFieldSchemaDefinition: SchemaTypeOptions<
  Map<string, number>
> = {
  type: Map,
  of: Number,
  required: true,
  default: {},
};
