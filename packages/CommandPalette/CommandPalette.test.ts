import { CommandPalette } from './CommandPalette.js'
import { CommandPaletteDataSource, type CommandPaletteData } from './CommandPaletteDataSource.js'
import './index.js'

type TestDataSourceOptions = {
	readonly name: string
	readonly order?: number
	readonly data?: Array<string>
	readonly searchResults?: Array<string>
	readonly fails?: boolean
	readonly newItemLabel?: string
}

class TestDataSource extends CommandPaletteDataSource<string> {
	override readonly name: string
	override readonly order: number
	override readonly icon = 'search' as CommandPaletteData['icon']

	readonly fetchSpy = jasmine.createSpy('fetch')
	readonly searchSpy = jasmine.createSpy('search')
	readonly commandSpy = jasmine.createSpy('command')

	constructor(private readonly options: TestDataSourceOptions) {
		super()
		this.name = options.name
		this.order = options.order ?? 0
	}

	// eslint-disable-next-line require-await
	override async fetch() {
		this.fetchSpy()
		if (this.options.fails) {
			throw new Error('This source is unavailable')
		}
		return this.options.data ?? []
	}

	// eslint-disable-next-line require-await
	override async search(keyword: string) {
		this.searchSpy(keyword)
		if (this.options.fails) {
			throw new Error('This source is unavailable')
		}
		return this.options.searchResults ?? []
	}

	override getItem(item: string): CommandPaletteData {
		return { icon: this.icon, label: item, command: () => this.commandSpy(item) }
	}

	override getNewItem(keyword?: string): CommandPaletteData | undefined {
		return !this.options.newItemLabel || !keyword
			? undefined
			: { icon: this.icon, label: `${this.options.newItemLabel} "${keyword}"`, command: () => this.commandSpy('new') }
	}
}

describe('CommandPalette', () => {
	let palette: CommandPalette

	afterEach(() => {
		if (palette?.matches(':popover-open')) {
			palette.hidePopover()
		}
		palette?.remove()
		for (const source of [...CommandPalette.dataSources]) {
			if (source instanceof TestDataSource) {
				CommandPalette.dataSources.delete(source)
			}
		}
	})

	async function setup(...sources: Array<TestDataSource>) {
		for (const source of sources) {
			CommandPalette.dataSources.add(source)
		}
		palette = document.body.appendChild(new CommandPalette)
		await palette.updateComplete
		await new Promise(resolve => setTimeout(resolve))
	}

	async function until(predicate: () => boolean, timeout = 4000) {
		const start = Date.now()
		while (!predicate()) {
			if (Date.now() - start > timeout) {
				throw new Error('Timed out waiting for the palette')
			}
			await new Promise(resolve => setTimeout(resolve, 20))
		}
		await palette.updateComplete
	}

	async function open() {
		const opened = new Promise<void>(resolve => palette.addEventListener('toggle', () => resolve(), { once: true }))
		palette.showPopover()
		await opened
		await palette.updateComplete
		await new Promise(resolve => setTimeout(resolve, 50))
	}

	async function close() {
		const closed = new Promise<void>(resolve => palette.addEventListener('toggle', () => resolve(), { once: true }))
		palette.hidePopover()
		await closed
		await palette.updateComplete
	}

	const searchField = () => palette.renderRoot.querySelector('mo-command-palette-search-field')!
	const list = () => palette.renderRoot.querySelector('mo-list')
	const items = () => [...palette.renderRoot.querySelectorAll<HTMLElement>('mo-list mo-list-item')]
	const labels = () => items().map(item => item.querySelector('.label')!.textContent!.trim())
	const tabs = () => [...palette.renderRoot.querySelectorAll('mo-tab')]
	const buttons = () => [...palette.renderRoot.querySelectorAll<HTMLElement>('#buttons mo-button')]

	const deepActiveElement = () => {
		let element = document.activeElement
		while (element?.shadowRoot?.activeElement) {
			element = element.shadowRoot.activeElement
		}
		return element
	}

	describe('opening and closing', () => {
		it('should focus and select the search field when opened', async () => {
			await setup(new TestDataSource({ name: 'A', data: ['Alpha'] }))
			palette.keyword = 'Alp'
			await until(() => searchField().inputElement.value === 'Alp')

			await open()

			expect(deepActiveElement()).toBe(searchField().inputElement)
			expect(searchField().inputElement.selectionStart).toBe(0)
			expect(searchField().inputElement.selectionEnd).toBe(3)
		})

		it('should seed the list focus on the first item when opened, and drop it when closed', async () => {
			await setup(new TestDataSource({ name: 'A', data: ['Alpha', 'Beta'] }))
			await until(() => items().length === 2)

			await open()

			expect(list()!.focusController.focusedItemIndex).toBe(0)

			await close()

			expect(list()!.focusController.focusedItemIndex).toBeUndefined()
		})

		it('should close on a click on the backdrop (the host itself) and stay open for clicks inside the card', async () => {
			await setup(new TestDataSource({ name: 'A', data: ['Alpha'] }))
			await until(() => items().length === 1)
			await open()

			palette.renderRoot.querySelector('mo-card')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			expect(palette.matches(':popover-open')).toBeTrue()

			palette.dispatchEvent(new MouseEvent('click', { bubbles: true }))

			expect(palette.matches(':popover-open')).toBeFalse()
		})
	})

	describe('searching', () => {
		it('should fetch every source\'s initial data when opened without a keyword', async () => {
			const a = new TestDataSource({ name: 'A', order: 1, data: ['Alpha'] })
			const b = new TestDataSource({ name: 'B', order: 2, data: ['Beta'] })
			await setup(a, b)

			await open()
			await until(() => items().length === 2)

			expect(a.fetchSpy).toHaveBeenCalledTimes(1)
			expect(b.fetchSpy).toHaveBeenCalledTimes(1)
			expect(labels()).toEqual(['Alpha', 'Beta'])
		})

		it('should search every source with the typed keyword', async () => {
			const a = new TestDataSource({ name: 'A', order: 1, data: ['Alpha'], searchResults: ['Alpha match'] })
			const b = new TestDataSource({ name: 'B', order: 2, data: ['Beta'], searchResults: ['Beta match'] })
			await setup(a, b)
			await until(() => items().length === 2)

			palette.keyword = 'match'
			await until(() => labels().join(',') === 'Alpha match,Beta match')

			expect(a.searchSpy).toHaveBeenCalledOnceWith('match')
			expect(b.searchSpy).toHaveBeenCalledOnceWith('match')
		})

		it('should highlight the matched part of the labels', async () => {
			await setup(new TestDataSource({ name: 'A', searchResults: ['Settings'] }))

			palette.keyword = 'ett'
			await until(() => labels().join(',') === 'Settings')

			expect(palette.renderRoot.querySelector('mo-list-item .match')!.textContent).toBe('ett')
		})

		it('should keep a failed source out of the list rather than failing the whole palette', async () => {
			const failing = new TestDataSource({ name: 'Failing', order: 1, fails: true })
			const working = new TestDataSource({ name: 'Working', order: 2, data: ['Alpha'] })
			await setup(failing, working)

			await until(() => labels().join(',') === 'Alpha')

			expect(failing.fetchSpy).toHaveBeenCalled()
			expect(labels()).toEqual(['Alpha'])
		})

		it('should show the empty state when nothing matches', async () => {
			await setup(new TestDataSource({ name: 'A', data: ['Alpha'], searchResults: [] }))
			await until(() => items().length === 1)

			palette.keyword = 'nothing matches this'
			await until(() => !!palette.renderRoot.querySelector('mo-empty-state'))

			expect(list()).toBeNull()
		})
	})

	describe('data source tabs', () => {
		it('should render one tab per data source, ordered by their order', async () => {
			const second = new TestDataSource({ name: 'Second', order: 2 })
			const first = new TestDataSource({ name: 'First', order: 1 })
			await setup(second, first)

			expect(tabs().length).toBe(3)
			expect(tabs()[0]!.value).toBeUndefined()
			expect(tabs().slice(1).map(tab => tab.value)).toEqual([first.id, second.id])
			expect(tabs().slice(1).map(tab => tab.textContent!.trim())).toEqual(['First', 'Second'])
		})

		it('should filter the list to the selected source\'s results', async () => {
			const a = new TestDataSource({ name: 'A', order: 1, data: ['Alpha'] })
			const b = new TestDataSource({ name: 'B', order: 2, data: ['Beta'] })
			await setup(a, b)
			await until(() => items().length === 2)

			palette.filteredDataSourceId = b.id
			await until(() => items().length === 1)

			expect(labels()).toEqual(['Beta'])
		})

		it('should cycle the source filter on Tab and back on Shift+Tab, wrapping around the All tab', async () => {
			const a = new TestDataSource({ name: 'A', order: 1 })
			const b = new TestDataSource({ name: 'B', order: 2 })
			await setup(a, b)
			await open()

			const tab = (shiftKey = false) => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }))

			tab()
			expect(palette.filteredDataSourceId).toBe(a.id)
			tab()
			expect(palette.filteredDataSourceId).toBe(b.id)
			tab()
			expect(palette.filteredDataSourceId).toBeUndefined()
			tab(true)
			expect(palette.filteredDataSourceId).toBe(b.id)
			tab(true)
			expect(palette.filteredDataSourceId).toBe(a.id)
			tab(true)
			expect(palette.filteredDataSourceId).toBeUndefined()
		})

		it('should ignore Tab while the palette is closed', async () => {
			await setup(new TestDataSource({ name: 'A', order: 1 }))

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))

			expect(palette.filteredDataSourceId).toBeUndefined()
		})
	})

	describe('commands', () => {
		it('should execute the clicked item\'s command and close the palette', async () => {
			const source = new TestDataSource({ name: 'A', data: ['Alpha'] })
			await setup(source)
			await until(() => items().length === 1)
			await open()

			items()[0]!.click()

			expect(source.commandSpy).toHaveBeenCalledOnceWith('Alpha')
			expect(palette.matches(':popover-open')).toBeFalse()
		})

		it('should offer the sources\' new-item commands as buttons, skipping sources that decline', async () => {
			const offering = new TestDataSource({ name: 'Offering', order: 1, newItemLabel: 'Create' })
			const declining = new TestDataSource({ name: 'Declining', order: 2 })
			await setup(offering, declining)
			expect(buttons().length).toBe(0)

			palette.keyword = 'thing'
			await until(() => buttons().length > 0)

			expect(buttons().length).toBe(1)
			expect(buttons()[0]!.textContent!.trim()).toBe('Create "thing"')
		})
	})
})