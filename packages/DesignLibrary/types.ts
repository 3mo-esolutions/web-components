declare global {
	type ParameterIndex<T extends (...args: any) => any, I extends number> = Parameters<T>[I]
	type FirstParameter<T extends (...args: any) => any> = ParameterIndex<T, 0>
}