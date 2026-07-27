/**
 * A read-only array-like and iterable view over items which the deriving class replaces as a whole.
 *
 * Deriving classes own how their items come to be and call `setItems` whenever they change, so that
 * consumers can spread, index, iterate and query them just like an array, while no consumer is able
 * to insert, remove or reorder items behind the deriving class's back.
 */
export abstract class ArrayLikeView<T> implements ArrayLike<T>, Iterable<T> {
	readonly [index: number]: T

	private items: ReadonlyArray<T> = []

	get length() { return this.items.length }

	protected setItems(items: ReadonlyArray<T>) {
		for (let index = items.length; index < this.items.length; ++index) {
			Reflect.deleteProperty(this, index)
		}
		this.items = items
		Object.assign(this, items)
	}

	[Symbol.iterator](): IterableIterator<T> {
		return this.items[Symbol.iterator]()
	}

	at(...args: Parameters<typeof this.items.at>) {
		return this.items.at(...args)
	}

	find(...args: Parameters<typeof this.items.find>) {
		return this.items.find(...args)
	}

	findIndex(...args: Parameters<typeof this.items.findIndex>) {
		return this.items.findIndex(...args)
	}

	filter(...args: Parameters<typeof this.items.filter>) {
		return this.items.filter(...args)
	}

	// Unlike the other members, the mapping ones are spelled out, as `Parameters` of a generic
	// signature erases its type parameter and would collapse the mapped result to `unknown`
	map<TResult>(callback: (item: T, index: number, items: ReadonlyArray<T>) => TResult) {
		return this.items.map(callback)
	}

	flatMap<TResult>(callback: (item: T, index: number, items: ReadonlyArray<T>) => TResult | ReadonlyArray<TResult>) {
		return this.items.flatMap(callback)
	}

	some(...args: Parameters<typeof this.items.some>) {
		return this.items.some(...args)
	}

	every(...args: Parameters<typeof this.items.every>) {
		return this.items.every(...args)
	}

	forEach(...args: Parameters<typeof this.items.forEach>) {
		return this.items.forEach(...args)
	}

	indexOf(...args: Parameters<typeof this.items.indexOf>) {
		return this.items.indexOf(...args)
	}

	includes(...args: Parameters<typeof this.items.includes>) {
		return this.items.includes(...args)
	}

	slice(...args: Parameters<typeof this.items.slice>) {
		return this.items.slice(...args)
	}
}