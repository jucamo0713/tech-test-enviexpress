export type PrimitiveType = string | number | boolean | null | undefined | Date;
export type PrimitiveTypeWithArray = PrimitiveType | PrimitiveTypeWithArray[];
export type PrimitiveObject = {
  [P in keyof unknown]: PrimitiveTypeWithArrayAndObject;
};
export type PrimitiveTypeWithArrayAndObject =
  | PrimitiveTypeWithArray
  | PrimitiveObject;
