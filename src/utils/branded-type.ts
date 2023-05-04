export const Brand = Symbol()
export type Brand = typeof Brand
export type BrandedType<T, TBrand extends string> = T & { [Brand]: TBrand }
