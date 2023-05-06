export type BrandedType<T, TBrand extends string> = T & { [BrandedType.Brand]: TBrand }
export namespace BrandedType {
	export const Brand = Symbol()
	export type Brand = typeof Brand
}
