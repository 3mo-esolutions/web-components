/** Constructing a formatter costs far more than using one, so each is kept per combination of arguments and reused. */
export function memoizeFormatConstructor<TArguments extends Array<unknown>, TFormatter>(Formatter: new (...args: TArguments) => TFormatter) {
	const formattersByArguments = new Map<string, TFormatter>()
	return (...args: TArguments) => {
		const key = getKey(args)
		const formatter = formattersByArguments.get(key) ?? new Formatter(...args)
		formattersByArguments.set(key, formatter)
		return formatter
	}
}

/**
 * Options name the same formatter in any order, so their entries are sorted. Intl ignores an option left undefined
 * but not one set to null, which JSON would otherwise write alike.
 */
function getKey(args: Array<unknown>) {
	return JSON.stringify(args.map(arg => !arg || typeof arg !== 'object' ? arg : Object.entries(arg)
		.filter(([, value]) => value !== undefined)
		.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)))
}
