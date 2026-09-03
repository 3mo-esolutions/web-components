import { CommandPaletteDataSource, type CommandPaletteData } from './CommandPaletteDataSource.js'

describe('CommandPaletteDataSource', () => {
	class TestDataSource extends CommandPaletteDataSource<string> {
		override readonly name = 'Test'
		override readonly icon = 'search' as CommandPaletteData['icon']

		readonly fetchSpy = jasmine.createSpy('fetch')
		readonly searchSpy = jasmine.createSpy('search')

		// eslint-disable-next-line require-await
		override async fetch() {
			this.fetchSpy()
			return ['Alpha', 'Beta']
		}

		// eslint-disable-next-line require-await
		override async search(keyword: string) {
			this.searchSpy(keyword)
			return [`${keyword} result`]
		}

		override getItem(item: string): CommandPaletteData {
			return { icon: this.icon, label: item, command: () => void 0 }
		}
	}

	let source: TestDataSource

	beforeEach(() => source = new TestDataSource)

	it('should fetch once and serve fetchData\'s mapped items from memory afterwards', async () => {
		const first = await source.fetchData()
		const second = await source.fetchData()

		expect(source.fetchSpy).toHaveBeenCalledTimes(1)
		expect(first.map(item => item.label)).toEqual(['Alpha', 'Beta'])
		expect(second).toBe(first)
	})

	it('should memoise searchData per keyword, re-searching only for new keywords', async () => {
		const first = await source.searchData('alpha')
		const again = await source.searchData('alpha')

		expect(source.searchSpy).toHaveBeenCalledOnceWith('alpha')
		expect(again).toBe(first)

		const other = await source.searchData('beta')

		expect(source.searchSpy).toHaveBeenCalledTimes(2)
		expect(source.searchSpy.calls.mostRecent().args).toEqual(['beta'])
		expect(other.map(item => item.label)).toEqual(['beta result'])
	})
})