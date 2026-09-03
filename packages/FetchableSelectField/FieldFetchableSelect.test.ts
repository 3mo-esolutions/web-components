import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldFetchableSelect } from './index.js'
import '.'

type SearchParameters = { page?: number, keyword?: string }
type FetchableSelect = FieldFetchableSelect<any, SearchParameters>

const fruits = ['Apple', 'Banana', 'Cherry']

const tick = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration))

async function settle(component: FetchableSelect) {
	await component.updateComplete
	await tick(30)
	await component.updateComplete
}

async function waitUntil(predicate: () => boolean, timeout = 2000) {
	const start = Date.now()
	while (!predicate() && Date.now() - start < timeout) {
		await tick(10)
	}
}

const optionTexts = (component: FetchableSelect) => component.options.map(option => option.text)

const visibleOptionTexts = (component: FetchableSelect) => component.options
	.filter(option => !option.hasAttribute('data-search-no-match'))
	.map(option => option.text)

const isNoResultsHintVisible = (component: FetchableSelect) =>
	getComputedStyle(component.renderRoot.querySelector('#no-options-hint') as HTMLElement).display !== 'none'

async function focusIn(component: FetchableSelect) {
	component['focusController'].focusIn()
	await settle(component)
}

async function type(component: FetchableSelect, keyword: string) {
	const input = component.searchInputElement!
	input.value = keyword
	input.dispatchEvent(new Event('input', { bubbles: true }))
	await settle(component)
}

async function closeMenu(component?: FetchableSelect) {
	if (!component) {
		return
	}
	component.open = false
	await component.updateComplete
	const menu = component.menu
	if (menu) {
		menu.open = false
		await menu.updateComplete
		if (menu.list) {
			menu.list.focusController.focusOut()
		}
		const popover = menu.renderRoot.querySelector('mo-popover')
		if (popover) {
			popover.open = false
			if (popover.matches(':popover-open')) {
				popover.hidePopover()
			}
			await popover.updateComplete
		}
	}
}

describe('FieldFetchableSelect', () => {
	let fetchSpy: jasmine.Spy<(parameters?: SearchParameters) => Promise<Array<any>>>

	beforeEach(() => {
		fetchSpy = jasmine.createSpy('fetch').and.callFake(() => Promise.resolve([...fruits]))
	})

	const fetchDelegate = (parameters?: SearchParameters) => fetchSpy(parameters)

	const fixture = new ComponentTestFixture<FetchableSelect>(html`
		<mo-field-fetchable-select label='Select' .fetch=${fetchDelegate}></mo-field-fetchable-select>
	`)

	afterEach(() => closeMenu(fixture.component))

	describe('fetching', () => {
		it('should fetch on connection and render an option per fetched item', async () => {
			await waitUntil(() => fixture.component.options.length === fruits.length)
			await settle(fixture.component)

			expect(fetchSpy).toHaveBeenCalledOnceWith(undefined)
			expect(optionTexts(fixture.component)).toEqual(fruits)
		})

		it('should dispatch dataFetch with the fetched data', async () => {
			await settle(fixture.component)
			const dataFetchSpy = jasmine.createSpy('dataFetch')
			fixture.component.dataFetch.subscribe(dataFetchSpy)

			await fixture.component.requestFetch()
			await settle(fixture.component)

			expect(dataFetchSpy).toHaveBeenCalledOnceWith(fruits)
		})

		it('should toggle the "fetching" attribute while the fetch is pending', async () => {
			await settle(fixture.component)
			expect(fixture.component.hasAttribute('fetching')).toBeFalse()
			let resolveFetch!: (data: Array<any>) => void
			fetchSpy.and.returnValue(new Promise<Array<any>>(resolve => resolveFetch = resolve))

			const fetching = fixture.component.requestFetch()
			await waitUntil(() => fixture.component.hasAttribute('fetching'))
			expect(fixture.component.hasAttribute('fetching')).toBeTrue()

			resolveFetch([...fruits])
			await fetching
			await settle(fixture.component)

			expect(fixture.component.hasAttribute('fetching')).toBeFalse()
		})

		it('should re-fetch when parameters change', async () => {
			await settle(fixture.component)
			fetchSpy.calls.reset()

			fixture.component.parameters = { page: 2 }
			await settle(fixture.component)

			expect(fetchSpy).toHaveBeenCalledOnceWith({ page: 2 })
		})

		it('should not re-fetch when parameters are replaced by a structurally equal object', async () => {
			fixture.component.parameters = { page: 2 }
			await settle(fixture.component)
			fetchSpy.calls.reset()

			fixture.component.parameters = { page: 2 }
			fixture.component.requestUpdate()
			await settle(fixture.component)

			expect(fetchSpy).not.toHaveBeenCalled()
		})

		it('should re-fetch on demand via requestFetch()', async () => {
			await settle(fixture.component)
			fetchSpy.calls.reset()

			await fixture.component.requestFetch()
			await settle(fixture.component)

			expect(fetchSpy).toHaveBeenCalledOnceWith(undefined)
		})
	})

	describe('options rendering', () => {
		it('should render at most optionsRenderLimit fetched options', async () => {
			await waitUntil(() => fixture.component.options.length === fruits.length)

			fixture.component.optionsRenderLimit = 2
			await settle(fixture.component)

			expect(optionTexts(fixture.component)).toEqual(['Apple', 'Banana'])
		})

		it('should render fetched options through optionTemplate when provided', async () => {
			await settle(fixture.component)
			fetchSpy.and.resolveTo([{ code: 'DE', label: 'Germany' }, { code: 'FR', label: 'France' }])
			fixture.component.optionTemplate = (data: any) => html`<mo-option value=${data.code} .data=${data}>${data.label}</mo-option>`

			await fixture.component.requestFetch()
			await waitUntil(() => fixture.component.options.length === 2)
			await settle(fixture.component)

			expect(optionTexts(fixture.component)).toEqual(['Germany', 'France'])
			expect(fixture.component.options.map(option => option.getAttribute('value'))).toEqual(['DE', 'FR'])
		})

		describe('with slotted options', () => {
			const slottedFixture = new ComponentTestFixture<FetchableSelect>(html`
				<mo-field-fetchable-select label='Select' .fetch=${fetchDelegate}>
					<mo-option value='static'>Static</mo-option>
				</mo-field-fetchable-select>
			`)

			it('should keep slotted static options alongside fetched options', async () => {
				await waitUntil(() => slottedFixture.component.options.length === fruits.length + 1)
				await settle(slottedFixture.component)

				expect(optionTexts(slottedFixture.component)).toEqual(['Static', ...fruits])
			})
		})
	})

	describe('value reconciliation', () => {
		let resolveFetch!: (data: Array<any>) => void

		beforeEach(() => {
			fetchSpy.and.returnValue(new Promise<Array<any>>(resolve => resolveFetch = resolve))
		})

		const deferredFixture = new ComponentTestFixture<FetchableSelect>(html`
			<mo-field-fetchable-select label='Select' value='1' .fetch=${fetchDelegate}></mo-field-fetchable-select>
		`)

		it('should resolve a value set before the fetch completed once the options arrive', async () => {
			expect(deferredFixture.component.options.length).toBe(0)
			expect(deferredFixture.component.valueInputElement.value).toBe('')

			resolveFetch([...fruits])
			await waitUntil(() => deferredFixture.component.valueInputElement.value === 'Banana')

			expect(deferredFixture.component.value).toBe(1)
			expect(deferredFixture.component.valueInputElement.value).toBe('Banana')
		})

		it('should keep the selection when a re-fetch returns the same data', async () => {
			resolveFetch([...fruits])
			await waitUntil(() => deferredFixture.component.valueInputElement.value === 'Banana')
			fetchSpy.and.callFake(() => Promise.resolve([...fruits]))

			await deferredFixture.component.requestFetch()
			await settle(deferredFixture.component)

			expect(deferredFixture.component.value).toBe(1)
			expect(deferredFixture.component.valueInputElement.value).toBe('Banana')
		})
	})

	describe('searchParameters', () => {
		const searchParameters = (keyword: string) => ({ keyword })

		const searchFixture = new ComponentTestFixture<FetchableSelect>(html`
			<mo-field-fetchable-select label='Select' searchable
				.fetch=${fetchDelegate}
				.searchParameters=${searchParameters}
			></mo-field-fetchable-select>
		`)

		afterEach(() => closeMenu(searchFixture.component))

		it('should fetch with parameters merged with searchParameters of the keyword when typing', async () => {
			searchFixture.component.parameters = { page: 1 }
			await settle(searchFixture.component)
			await focusIn(searchFixture.component)
			fetchSpy.calls.reset()

			await type(searchFixture.component, 'ban')
			await settle(searchFixture.component)

			expect(fetchSpy).toHaveBeenCalledOnceWith({ page: 1, keyword: 'ban' })
		})

		it('should coalesce consecutive keystrokes into a single throttled fetch', async () => {
			await settle(searchFixture.component)
			await focusIn(searchFixture.component)
			fetchSpy.calls.reset()
			const input = searchFixture.component.searchInputElement!

			for (const keyword of ['b', 'ba', 'ban', 'bana', 'banan']) {
				input.value = keyword
				input.dispatchEvent(new Event('input', { bubbles: true }))
				await tick(50)
			}
			await tick(700)
			await settle(searchFixture.component)

			expect(fetchSpy.calls.count()).toBe(2)
			expect(fetchSpy.calls.first().args).toEqual([{ keyword: 'b' }])
			expect(fetchSpy.calls.mostRecent().args).toEqual([{ keyword: 'banan' }])
		})

		it('should render the search results instead of the initially fetched options while a keyword is present', async () => {
			fetchSpy.and.callFake(parameters => Promise.resolve(parameters?.keyword ? ['Banana bread'] : [...fruits]))
			await waitUntil(() => searchFixture.component.options.length === fruits.length)
			expect(optionTexts(searchFixture.component)).toEqual(fruits)

			await focusIn(searchFixture.component)
			await type(searchFixture.component, 'ban')
			await waitUntil(() => searchFixture.component.options.length === 1)

			expect(optionTexts(searchFixture.component)).toEqual(['Banana bread'])
		})

		it('should restore the initially fetched options when the keyword is cleared', async () => {
			fetchSpy.and.callFake(parameters => Promise.resolve(parameters?.keyword ? ['Banana bread'] : [...fruits]))
			await waitUntil(() => searchFixture.component.options.length === fruits.length)
			await focusIn(searchFixture.component)
			await type(searchFixture.component, 'ban')
			await waitUntil(() => searchFixture.component.options.length === 1)

			await type(searchFixture.component, '')
			await waitUntil(() => searchFixture.component.options.length === fruits.length)

			expect(optionTexts(searchFixture.component)).toEqual(fruits)
		})

		it('should not show the no-results hint while a search fetch is pending', async () => {
			let resolveSearch!: (data: Array<any>) => void
			fetchSpy.and.callFake(parameters => parameters?.keyword
				? new Promise<Array<any>>(resolve => resolveSearch = resolve)
				: Promise.resolve([...fruits]))
			await waitUntil(() => searchFixture.component.options.length === fruits.length)
			await focusIn(searchFixture.component)

			await type(searchFixture.component, 'zzz')
			await settle(searchFixture.component)

			expect(isNoResultsHintVisible(searchFixture.component)).toBeFalse()

			resolveSearch([])
			await waitUntil(() => isNoResultsHintVisible(searchFixture.component))

			expect(isNoResultsHintVisible(searchFixture.component)).toBeTrue()
		})

		it('should filter the already-fetched options locally when searchParameters is not set', async () => {
			await waitUntil(() => fixture.component.options.length === fruits.length)
			fixture.component.searchable = true
			await focusIn(fixture.component)
			fetchSpy.calls.reset()

			await type(fixture.component, 'ban')

			expect(fetchSpy).not.toHaveBeenCalled()
			expect(visibleOptionTexts(fixture.component)).toEqual(['Banana'])
		})
	})
})