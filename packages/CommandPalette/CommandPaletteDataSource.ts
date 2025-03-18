import { type MaterialIcon } from '@3mo/del'
import { Memoize as memoize } from 'typescript-memoize'

export interface CommandPaletteData {
	icon: MaterialIcon
	label: string
	secondaryLabel?: string
	command: () => void
}

export abstract class CommandPaletteDataSource<T> {
	protected static readonly take = 5
	readonly take = CommandPaletteDataSource.take

	readonly id = Math.random().toString(36).substring(7)
	abstract readonly name: string
	abstract readonly icon: MaterialIcon
	readonly order: number = Number.MAX_SAFE_INTEGER

	abstract fetch(): Promise<Array<T>>

	@memoize()
	async fetchData() {
		const results = await this.fetch()
		return results.map(result => this.getItem(result))
	}

	abstract search(keyword: string): Promise<Array<T>>

	@memoize()
	async searchData(keyword: string) {
		const results = await this.search(keyword)
		return results.map(result => this.getItem(result))
	}

	abstract getItem(item: T): CommandPaletteData

	getNewItem?(query?: string): CommandPaletteData | undefined
}