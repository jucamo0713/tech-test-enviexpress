import { SchemaTypeOptions } from 'mongoose';

export const TranslatableFieldSchemaDefinition: SchemaTypeOptions<
  Map<string, string>
> = {
  type: Map,
  of: String,
  required: true,
  default: {},
};
