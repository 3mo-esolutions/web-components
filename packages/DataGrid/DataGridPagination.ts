import { equals } from '@a11d/equals'

export type DataGridPaginationStrategy = 'scroll' | 'pages'
export type DataGridPaginationSize = number | 'auto'

type Slots = {
	readonly strategy?: DataGridPaginationStrategy
	readonly size?: DataGridPaginationSize
}

/** Allowed string literals for pagination attributes and properties. */
export type DataGridPaginationLiteral =
	| DataGridPaginationStrategy
	| `${DataGridPaginationStrategy} ${number}`
	| `${DataGridPaginationStrategy} auto`
	| `${number} ${DataGridPaginationStrategy}`
	| `auto ${DataGridPaginationStrategy}`
	| `${number}`
	| 'auto'

export type DataGridPaginationLike =
	| DataGridPagination
	| DataGridPaginationLiteral | (string & {})
	| DataGridPaginationSize
	| Slots

const strategies: ReadonlyArray<DataGridPaginationStrategy> = ['scroll', 'pages']

const isStrategy = (value: unknown): value is DataGridPaginationStrategy =>
	strategies.includes(value as DataGridPaginationStrategy)

/**
 * Represents data grid pagination configuration (strategy: 'scroll' | 'pages', size: number | 'auto').
 *
 * @ssr true
 */
export class DataGridPagination implements Slots {
	/** Parses whitespace-separated pagination string tokens (e.g. 'pages 100', 'scroll'). */
	static parse(text: string) {
		const tokens = text.trim().split(/\s+/).filter(token => token.length > 0)
		const slots: { strategy?: DataGridPaginationStrategy, size?: DataGridPaginationSize } = {}

		for (const token of tokens) {
			const slot = isStrategy(token) ? 'strategy' : token === 'auto' || !Number.isNaN(Number(token)) ? 'size' : undefined
			const value = slot === 'strategy' ? token as DataGridPaginationStrategy : token === 'auto' ? 'auto' : Number(token)

			if (slot === undefined) {
				/* eslint-disable-next-line no-console */
				console.warn(`[DataGridPagination] Ignoring the unknown token "${token}". Expected "scroll", "pages", "auto" or a number.`)
			} else if (slots[slot] !== undefined) {
				/* eslint-disable-next-line no-console */
				console.warn(`[DataGridPagination] Ignoring the token "${token}", as a ${slot} has already been specified.`)
			} else {
				Object.assign(slots, { [slot]: value })
			}
		}

		return DataGridPagination.from(slots)
	}

	/** Normalizes pagination inputs into a DataGridPagination instance or undefined. */
	static from(value: DataGridPaginationLike | undefined | null): DataGridPagination | undefined {
		if (value === undefined || value === null) {
			return undefined
		}

		if (value instanceof DataGridPagination) {
			return value
		}

		if (typeof value === 'number') {
			return new DataGridPagination({ size: value })
		}

		if (typeof value === 'string') {
			return DataGridPagination.parse(value)
		}

		const strategy = value.strategy
		const size = value.size === 'auto' ? undefined : value.size

		return strategy === undefined && size === undefined
			? undefined
			: new DataGridPagination({ strategy, size })
	}

	readonly strategy?: DataGridPaginationStrategy
	readonly size?: Exclude<DataGridPaginationSize, 'auto'>

	private constructor(slots: Slots) {
		this.strategy = slots.strategy
		this.size = slots.size === 'auto' ? undefined : slots.size
		Object.freeze(this)
	}

	/** Returns a new DataGridPagination with updated slots. */
	with(changes: Slots) {
		return DataGridPagination.from({
			strategy: 'strategy' in changes ? changes.strategy : this.strategy,
			size: 'size' in changes ? changes.size : this.size,
		})
	}

	/** Returns canonical whitespace-separated string representation. */
	toString() {
		return [this.strategy, this.size].filter(slot => slot !== undefined).join(' ')
	}

	toJSON() {
		return this.toString()
	}

	[equals](other: unknown) {
		const pagination = other instanceof DataGridPagination ? other : undefined
		return pagination?.strategy === this.strategy && pagination?.size === this.size
	}
}