import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid, DataGridSelectability, DataGridSelectionBehaviorOnDataChange, DataGridSortingStrategy } from '@3mo/data-grid'
import { FetchableDataGrid, type FetchableDataGridResult } from './FetchableDataGrid.js'
import './index.js'

type Person = { id: number, name: string }
type Parameters = { search: string, page?: number, pageSize?: number, sortBy?: string }
type Grid = FetchableDataGrid<Person, Parameters>

let total = 100
let fetchCount = 0
let fetches = new Array<{ search?: string, page: number, pageSize: number }>()
const fetchesOf = (search: string) => fetches.filter(parameters => parameters.search === search)
let failFromPage = Number.POSITIVE_INFINITY
let resultShape: 'dataLength' | 'hasNextPage' = 'dataLength'

const people = (count: number) => new Array(count).fill(undefined).map((_, index) => ({ id: index + 1, name: `Person ${index + 1}` }))

const fetch = ({ search, page = 1, pageSize = 10 }: Parameters) => {
	fetchCount++
	fetches.push({ search, page, pageSize })
	if (page >= failFromPage) {
		return Promise.reject(new Error('The page could not be fetched.'))
	}
	const data = people(total).slice((page - 1) * pageSize, page * pageSize)
	return Promise.resolve(resultShape === 'dataLength'
		? { data, dataLength: total }
		: { data, hasNextPage: page * pageSize < total })
}

const drain = async <T>(generator: AsyncGenerator<number, T>) => {
	while (true) {
		const iteration = await generator.next()
		if (iteration.done) {
			return iteration.value
		}
	}
}

const paginationParameters = (parameters: { page: number, pageSize: number }) => parameters

let deferredFetches = new Array<{ readonly parameters: Parameters, readonly resolve: (result: FetchableDataGridResult<Person>) => void }>()
const deferredFetch = (parameters: Parameters) => new Promise<FetchableDataGridResult<Person>>(resolve => deferredFetches.push({ parameters, resolve }))

const sortParametersOf = (grid: () => Grid) => () => ({
	sortBy: (grid().sorting as Array<{ readonly selector: string }> | undefined)?.[0]?.selector,
})

const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 6000) => {
	const start = performance.now()
	while (condition() === false) {
		if (performance.now() - start > timeoutInMilliseconds) {
			throw new Error('The condition has not been met in time.')
		}
		await new Promise(resolve => setTimeout(resolve, 10))
	}
}

const useVirtualTime = () => {
	beforeEach(() => jasmine.clock().install())
	afterEach(async () => {
		await flushMicrotasks()
		jasmine.clock().uninstall()
	})
}

const flushMicrotasks = async (turns = 6) => {
	for (let index = 0; index < turns; index++) {
		await Promise.resolve()
	}
}

const advance = async (milliseconds: number, stepInMilliseconds = 50) => {
	await flushMicrotasks()
	for (let elapsed = 0; elapsed < milliseconds; elapsed += stepInMilliseconds) {
		jasmine.clock().tick(Math.min(stepInMilliseconds, milliseconds - elapsed))
		await flushMicrotasks()
	}
}

const advanceUntil = async (condition: () => boolean, timeoutInMilliseconds = 6000, stepInMilliseconds = 50) => {
	await flushMicrotasks()
	for (let elapsed = 0; elapsed < timeoutInMilliseconds && condition() === false; elapsed += stepInMilliseconds) {
		jasmine.clock().tick(stepInMilliseconds)
		await flushMicrotasks()
	}
	if (condition() === false) {
		throw new Error('The condition has not been met in virtual time.')
	}
}

const settle = async <T>(promise: Promise<T>, timeoutInMilliseconds = 6000) => {
	let settlement: { readonly value: T } | { readonly error: unknown } | undefined
	promise.then(value => settlement = { value }, error => settlement = { error })
	await advanceUntil(() => settlement !== undefined, timeoutInMilliseconds)
	if (settlement && 'error' in settlement) {
		throw settlement.error
	}
	return (settlement as { readonly value: T }).value
}

describe('FetchableDataGrid', () => {
	const defaultPageSize = DataGrid.pageSize.value

	beforeEach(() => {
		total = 100
		fetchCount = 0
		fetches = []
		deferredFetches = []
		failFromPage = Number.POSITIVE_INFINITY
		resultShape = 'dataLength'
		DataGrid.pageSize.value = 10
	})

	afterEach(() => DataGrid.pageSize.value = defaultPageSize)

	describe('fetch lifecycle', () => {
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'lifecycle' } satisfies Parameters}
				.fetch=${deferredFetch}
			></mo-fetchable-data-grid>
		` as any)

		const pending = () => fixture.component.fetcherController.pending
		const awaitPendingFetch = () => waitUntil(() => deferredFetches.length > 0 && pending())

		it('should toggle the fetching attribute on the host while a fetch is pending', async () => {
			await awaitPendingFetch()
			await fixture.component.updateComplete

			expect(fixture.component.hasAttribute('fetching')).toBeTrue()

			deferredFetches[0]!.resolve(people(3))
			await waitUntil(() => pending() === false)
			await fixture.component.updateComplete

			expect(fixture.component.hasAttribute('fetching')).toBeFalse()
		})

		it('should replace the content with the fetching indicator during a non-silent fetch', async () => {
			await awaitPendingFetch()
			await fixture.component.updateComplete

			expect(fixture.component.fetcherController.silent).toBeFalse()
			expect(fixture.component.renderRoot.querySelector('#fetching-indicator')).not.toBeNull()
			expect(fixture.component.rows.length).toBe(0)

			deferredFetches[0]!.resolve(people(3))
			await waitUntil(() => fixture.component.rows.length === 3)

			expect(fixture.component.renderRoot.querySelector('#fetching-indicator')).toBeNull()
		})

		it('should dispatch dataFetch with the raw result of every fetch', async () => {
			const results = new Array<unknown>()
			fixture.component.addEventListener('dataFetch', event => results.push((event as CustomEvent).detail))
			await awaitPendingFetch()

			const paginated = { data: people(2), dataLength: 42 }
			deferredFetches[0]!.resolve(paginated)
			await waitUntil(() => results.length === 1)

			fixture.component.setParameters({ search: 'lifecycle-again' })
			await waitUntil(() => deferredFetches.length === 2)
			const plain = people(1)
			deferredFetches[1]!.resolve(plain)
			await waitUntil(() => results.length === 2)

			expect(results[0]).toBe(paginated)
			expect(results[1]).toBe(plain)
		})

		it('should resolve requestFetch only after the fetched data has been handed over', async () => {
			await awaitPendingFetch()
			deferredFetches[0]!.resolve(people(3))
			await waitUntil(() => fixture.component.data.length === 3)

			let dataLengthOnResolution: number | undefined
			const request = fixture.component.requestFetch().then(() => dataLengthOnResolution = fixture.component.data.length)
			await waitUntil(() => deferredFetches.length === 2)

			expect(dataLengthOnResolution).toBeUndefined()

			deferredFetches[1]!.resolve(people(7))
			await request

			expect(dataLengthOnResolution).toBe(7)
		})

		it('should coalesce rapid parameter changes into a single fetch (500ms throttle)', async () => {
			await awaitPendingFetch()
			deferredFetches[0]!.resolve(people(1))
			await waitUntil(() => fixture.component.data.length === 1)
			fixture.component.fetch = fetch

			for (const search of ['coalesce-1', 'coalesce-2', 'coalesce-3']) {
				fixture.component.setParameters({ search })
				await fixture.component.updateComplete
			}
			await waitUntil(() => fetchesOf('coalesce-3').length === 1)

			expect(fetchesOf('coalesce-1').length).toBe(0)
			expect(fetchesOf('coalesce-2').length).toBe(0)
			expect(fetchesOf('coalesce-3').length).toBe(1)
		})
	})

	describe('parameters', () => {
		useVirtualTime()

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'params' } satisfies Parameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should fetch automatically when the parameters property changes', async () => {
			await advanceUntil(() => fetchesOf('params').length === 1)

			fixture.component.parameters = { search: 'params-changed' }

			await advanceUntil(() => fetchesOf('params-changed').length === 1)
			expect(fetchesOf('params-changed').length).toBe(1)
			expect(fixture.component.data.length).toBe(10)
		})

		it('should not refetch when the parameters are replaced by a structurally equal object', async () => {
			await advanceUntil(() => fetchesOf('params').length === 1)

			fixture.component.parameters = { search: 'params' }
			await advance(800)

			expect(fetchesOf('params').length).toBe(1)
		})

		it('should dispatch parametersChange when setParameters is called', () => {
			const dispatched = new Array<unknown>()
			fixture.component.addEventListener('parametersChange', event => dispatched.push((event as CustomEvent).detail))

			fixture.component.setParameters({ search: 'via-set-parameters' })

			expect(dispatched).toEqual([{ search: 'via-set-parameters' }])
			expect(fixture.component.parameters).toEqual({ search: 'via-set-parameters' })
		})

		it('should not dispatch parametersChange when parameters is assigned directly', async () => {
			const dispatched = new Array<unknown>()
			fixture.component.addEventListener('parametersChange', event => dispatched.push((event as CustomEvent).detail))

			fixture.component.parameters = { search: 'via-assignment' }
			await advanceUntil(() => fetchesOf('via-assignment').length === 1)

			expect(dispatched).toEqual([])
		})

		describe('without any parameters', () => {
			const fixture = new ComponentTestFixture<Grid>(html`
				<mo-fetchable-data-grid style='height: 300px' .fetch=${() => Promise.resolve([])}></mo-fetchable-data-grid>
			` as any)

			const noSelectionSlot = () => fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=error-no-selection]')

			it('should show the default empty state prompting a filter selection while no parameters are set', async () => {
				await advanceUntil(() => !!noSelectionSlot())

				const emptyState = fixture.component.renderRoot.querySelector('mo-empty-state')
				expect(emptyState?.getAttribute('icon')).toBe('touch_app')
				expect(emptyState?.textContent?.trim()).toBe('Make a filter selection')
				expect(noSelectionSlot()?.assignedElements().length).toBe(0)
			})

			describe('with slotted error-no-selection content', () => {
				const slottedFixture = new ComponentTestFixture<Grid>(html`
					<mo-fetchable-data-grid style='height: 300px' .fetch=${() => Promise.resolve([])}>
						<div slot='error-no-selection' id='custom-no-selection'>Choose something</div>
					</mo-fetchable-data-grid>
				` as any)

				it('should render slotted error-no-selection content instead of the default empty state', async () => {
					const slot = () => slottedFixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=error-no-selection]')
					await advanceUntil(() => !!slot())

					expect(slot()?.assignedElements().map(element => element.id)).toEqual(['custom-no-selection'])
					expect(slottedFixture.component.renderRoot.querySelector('mo-empty-state')?.checkVisibility()).toBeFalsy()
				})
			})
		})
	})

	describe('silent fetch', () => {
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px' silentFetch
				.parameters=${{ search: 'silent' } satisfies Parameters}
				.fetch=${deferredFetch}
			></mo-fetchable-data-grid>
		` as any)

		const settleInitialFetch = async (data = people(3)) => {
			await waitUntil(() => deferredFetches.length === 1 && fixture.component.fetcherController.pending)
			deferredFetches[0]!.resolve(data)
			await waitUntil(() => fixture.component.fetcherController.pending === false && fixture.component.data.length === data.length)
			await fixture.component.updateComplete
		}

		it('should keep the current content visible during a refetch when silentFetch is set and data is present', async () => {
			await settleInitialFetch()

			const request = fixture.component.requestFetch()
			await waitUntil(() => deferredFetches.length === 2)
			await fixture.component.updateComplete

			expect(fixture.component.fetcherController.silent).toBeTrue()
			expect(fixture.component.renderRoot.querySelector('#fetching-indicator')).toBeNull()
			expect(fixture.component.rows.length).toBe(3)

			deferredFetches[1]!.resolve(people(5))
			await request

			expect(fixture.component.data.length).toBe(5)
		})

		it('should fall back to a visible fetch when there is no data yet despite silentFetch', async () => {
			await settleInitialFetch([])

			const request = fixture.component.requestFetch()
			await waitUntil(() => deferredFetches.length === 2)
			await fixture.component.updateComplete

			expect(fixture.component.silentFetch).toBeTrue()
			expect(fixture.component.fetcherController.silent).toBeFalse()
			expect(fixture.component.renderRoot.querySelector('#fetching-indicator')).not.toBeNull()

			deferredFetches[1]!.resolve(people(2))
			await request
		})

		it('should maintain the selection across a silent refetch instead of applying selectionBehaviorOnDataChange', async () => {
			fixture.component.selectability = DataGridSelectability.Multiple
			await settleInitialFetch()
			fixture.component.select([fixture.component.data[0]!])
			await fixture.component.updateComplete
			expect(fixture.component.selectedData.map(person => person.id)).toEqual([1])

			const request = fixture.component.requestFetch()
			await waitUntil(() => deferredFetches.length === 2)
			deferredFetches[1]!.resolve(people(3))
			await request

			expect(fixture.component.selectionBehaviorOnDataChange).toBe(DataGridSelectionBehaviorOnDataChange.Reset)
			expect(fixture.component.selectedData.map(person => person.id)).toEqual([1])
			expect(fixture.component.selectedData[0]).toBe(fixture.component.data[0])
		})

		describe('while infinite-scrolling', () => {
			const streamingFixture = new ComponentTestFixture<Grid>(html`
				<mo-fetchable-data-grid style='height: 0px' silentFetch
					.parameters=${{ search: 'silent-stream' } satisfies Parameters}
					.paginationParameters=${paginationParameters}
					.fetch=${fetch}
				></mo-fetchable-data-grid>
			` as any)

			it('should not apply silentFetch while infinite-scrolling (streams restore via explicit silent requests instead)', async () => {
				await waitUntil(() => streamingFixture.component.data.length > 0)
				expect(streamingFixture.component.hasInfiniteScroll).toBeTrue()

				const request = streamingFixture.component.requestFetch()

				expect(streamingFixture.component.fetcherController.silent).toBeFalse()

				await request
				const silentRequest = streamingFixture.component.requestFetch({ silent: true })

				expect(streamingFixture.component.fetcherController.silent).toBeTrue()

				await silentRequest
			})
		})
	})

	describe('server-side sorting', () => {
		const fetchSpy = jasmine.createSpy('fetch').and.callFake(fetch)

		beforeEach(() => fetchSpy.calls.reset())

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'sorting' } satisfies Parameters}
				.sortParameters=${sortParametersOf(() => fixture.component)}
				.fetch=${fetchSpy}
			></mo-fetchable-data-grid>
		` as any)

		const parametersOfCall = (index: number) => fetchSpy.calls.all()[index]!.args[0] as Parameters

		it('should refetch with the merged sort parameters when the sorting changes', async () => {
			await waitUntil(() => fetchSpy.calls.count() === 1)
			expect(parametersOfCall(0).search).toBe('sorting')
			expect(parametersOfCall(0).sortBy).toBeUndefined()

			fixture.component.sort([{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }])

			await waitUntil(() => fetchSpy.calls.count() === 2)
			expect(parametersOfCall(1)).toEqual({ search: 'sorting', sortBy: 'name' })
			expect(fetchSpy.calls.count()).toBe(2)
		})
	})

	describe('infinite scrolling', () => {
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 0px'
				.parameters=${{ search: 'a' } satisfies Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should be the default for server-side pagination', () => {
			expect(fixture.component.hasInfiniteScroll).toBeTrue()
		})

		it('should be opted out of by a pagination specifying the pages strategy', async () => {
			fixture.component.setPagination('pages 25')
			await fixture.component.updateComplete

			expect(fixture.component.hasInfiniteScroll).toBeFalse()
		})

		it('should be kept by a pagination specifying only a size', async () => {
			fixture.component.setPagination(25)
			await fixture.component.updateComplete

			expect(fixture.component.hasInfiniteScroll).toBeTrue()
			expect(fixture.component.pageSize).toBe(25)
		})

		it('should chunk by the persisted page size where no size is specified', () => {
			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'scroll', size: DataGrid.pageSize.value })
		})

		it('should be opted out of by a context-aware application default', () => {
			try {
				FetchableDataGrid.defaultPagination = grid => grid.hasServerSidePagination ? 'pages' : undefined
				expect(fixture.component.hasInfiniteScroll).toBeFalse()
				expect(fixture.component.pageSize).toBe(DataGrid.pageSize.value)
			} finally {
				FetchableDataGrid.defaultPagination = undefined
			}
		})

		it('should not be enabled without server-side pagination', async () => {
			fixture.component.paginationParameters = undefined
			await fixture.component.updateComplete

			expect(fixture.component.hasInfiniteScroll).toBeFalse()
		})

		it('should replace the page navigation in the footer with a plain count, keeping the size menu', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			const footer = () => fixture.component.renderRoot.querySelector('mo-data-grid-footer')
			await footer()?.updateComplete

			expect(fixture.component.hasPagination).toBeTrue()
			expect(footer()?.renderRoot.querySelector('mo-icon-button')).toBeNull()
			expect(footer()?.renderRoot.querySelector('mo-menu')).not.toBeNull()

			fixture.component.setPagination('pages 25')
			await fixture.component.updateComplete
			await footer()?.updateComplete

			expect(footer()?.renderRoot.querySelector('mo-icon-button')).not.toBeNull()
			expect(footer()?.renderRoot.querySelector('mo-menu')).not.toBeNull()
		})

		it('should export all data regardless of what has been streamed so far', async () => {
			await waitUntil(() => fixture.component.data.length > 0)

			const records = await drain(fixture.component.getCsvData())

			expect(records.length).toBe(100)
			expect(records[0]?.data.id).toBe(1)
			expect(records.at(-1)?.data.id).toBe(100)
			expect(fixture.component.data.length).toBe(10)
		})

		it('should export across multiple export pages of a dataLength-shaped source', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			total = 600

			const records = await drain(fixture.component.getCsvData())

			expect(records.length).toBe(600)
			expect(records.at(-1)?.data.id).toBe(600)
		})

		it('should export across multiple export pages of a hasNextPage-shaped source', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			resultShape = 'hasNextPage'
			total = 600

			const records = await drain(fixture.component.getCsvData())

			expect(records.length).toBe(600)
			expect(records.at(-1)?.data.id).toBe(600)
		})

		it('should fetch pages of the persisted page size', async () => {
			await waitUntil(() => fixture.component.data.length > 0)

			expect(fixture.component.pageSize).toBe(10)
			expect(fixture.component.data.length).toBe(10)
		})

		it('should append the following pages instead of replacing the stream', async () => {
			await waitUntil(() => fixture.component.data.length > 0)

			await fixture.component.fetcherController.fetchNextPage()

			expect(fetchCount).toBe(2)
			expect(fixture.component.data.length).toBe(20)
			expect(fixture.component.data[0]?.id).toBe(1)
			expect(fixture.component.data[10]?.id).toBe(11)
		})

		it('should keep the total data length across pages', async () => {
			await waitUntil(() => fixture.component.data.length > 0)

			await fixture.component.fetcherController.fetchNextPage()

			expect(fixture.component.dataLength).toBe(100)
			expect(fixture.component.hasNextPage).toBeTrue()
		})

		it('should end the stream once the last page has been appended', async () => {
			total = 15
			fixture.component.requestFetch()
			await waitUntil(() => fixture.component.data.length > 0)

			await fixture.component.fetcherController.fetchNextPage()

			expect(fixture.component.data.length).toBe(15)
			expect(fixture.component.hasNextPage).toBeFalse()
		})

		it('should end the stream when a page comes back empty although another one is claimed to be available', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			total = 10

			await fixture.component.fetcherController.fetchNextPage()

			expect(fixture.component.data.length).toBe(10)
			expect(fixture.component.hasNextPage).toBeFalse()
		})

		it('should stream and end hasNextPage-shaped results all the same', async () => {
			resultShape = 'hasNextPage'
			total = 15
			await fixture.component.requestFetch()
			await waitUntil(() => fixture.component.dataLength === undefined && fixture.component.data.length === 10)

			expect(fixture.component.dataLength).toBeUndefined()
			expect(fixture.component.hasNextPage).toBeTrue()

			const hasFurtherPage = await fixture.component.fetcherController.fetchNextPage()

			expect(fixture.component.data.length).toBe(15)
			expect(hasFurtherPage).toBeFalse()
			expect(fixture.component.hasNextPage).toBeFalse()
		})

		it('should restart the stream when the parameters change', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			expect(fixture.component.data.length).toBe(20)

			fixture.component.setParameters({ search: 'b' })

			await waitUntil(() => fixture.component.data.length === 10)
			expect(fixture.component.data.length).toBe(10)
		})

		it('should not append a page which was in flight while the stream was restarted', async () => {
			await waitUntil(() => fixture.component.data.length > 0)

			const page = fixture.component.fetcherController.fetchNextPage()
			fixture.component.setParameters({ search: 'b' })
			await page
			await waitUntil(() => fetchCount >= 3)
			await waitUntil(() => fixture.component.data.length === 10)

			await new Promise(resolve => setTimeout(resolve, 100))
			expect(fixture.component.data.length).toBe(10)
		})

		it('should scroll back to the start when the parameters change', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			const scrollToStart = spyOn(fixture.component.infiniteScrollController, 'scrollToStart')

			fixture.component.setParameters({ search: 'b' })
			await waitUntil(() => fixture.component.data.length === 10)

			expect(scrollToStart).toHaveBeenCalled()
		})

		it('should restore the stream to its already loaded extent in a single request when refetched', async () => {
			fixture.component.setParameters({ search: 'restore' })
			await fixture.component.updateComplete
			await fixture.component.requestFetch()
			await fixture.component.fetcherController.fetchNextPage()
			await fixture.component.fetcherController.fetchNextPage()
			expect(fixture.component.data.length).toBe(30)
			const fetchCountBeforeRefetch = fetchesOf('restore').length

			await fixture.component.requestFetch()

			expect(fetchesOf('restore').length).toBe(fetchCountBeforeRefetch + 1)
			expect(fetchesOf('restore').at(-1)).toEqual({ search: 'restore', page: 1, pageSize: 30 })
			expect(fixture.component.data.length).toBe(30)
			expect(fixture.component.data[0]?.id).toBe(1)
			expect(fixture.component.data.at(-1)?.id).toBe(30)
			expect(fixture.component.hasNextPage).toBeTrue()
		})

		it('should keep the scroll position when refetching the same stream', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			const scrollToStart = spyOn(fixture.component.infiniteScrollController, 'scrollToStart')

			await fixture.component.requestFetch()

			expect(scrollToStart).not.toHaveBeenCalled()
		})

		it('should continue the stream where the restored extent ended', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			await fixture.component.fetcherController.fetchNextPage()
			await fixture.component.requestFetch()

			await fixture.component.fetcherController.fetchNextPage()

			expect(fixture.component.data.length).toBe(40)
			expect(fixture.component.data[30]?.id).toBe(31)
			expect(fixture.component.data.at(-1)?.id).toBe(40)
		})

		it('should restore the extent on a silent refetch all the same', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			const scrollToStart = spyOn(fixture.component.infiniteScrollController, 'scrollToStart')

			await fixture.component.requestFetch({ silent: true })

			expect(fixture.component.data.length).toBe(20)
			expect(scrollToStart).not.toHaveBeenCalled()
		})

		it('should restore and keep streaming a hasNextPage-shaped source', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			resultShape = 'hasNextPage'

			await fixture.component.requestFetch()

			expect(fixture.component.data.length).toBe(20)
			expect(fixture.component.dataLength).toBeUndefined()
			expect(fixture.component.hasNextPage).toBeTrue()
		})

		it('should end the stream when the restored extent reaches a shrunken total', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await fixture.component.fetcherController.fetchNextPage()
			await fixture.component.fetcherController.fetchNextPage()
			total = 25

			await fixture.component.requestFetch()

			expect(fixture.component.data.length).toBe(25)
			expect(fixture.component.hasNextPage).toBeFalse()
		})

		describe('with server-side sorting', () => {
			const sortedFixture = new ComponentTestFixture<Grid>(html`
				<mo-fetchable-data-grid style='height: 0px'
					.parameters=${{ search: 'stream-sorting' } satisfies Parameters}
					.paginationParameters=${paginationParameters}
					.sortParameters=${sortParametersOf(() => sortedFixture.component)}
					.fetch=${fetch}
				></mo-fetchable-data-grid>
			` as any)

			it('should restart the stream when the sorting changes', async () => {
				await waitUntil(() => sortedFixture.component.data.length === 10)
				await sortedFixture.component.fetcherController.fetchNextPage()
				expect(sortedFixture.component.data.length).toBe(20)

				sortedFixture.component.sort([{ selector: 'name', strategy: DataGridSortingStrategy.Ascending }])

				await waitUntil(() => fetchesOf('stream-sorting').length === 3)
				await waitUntil(() => sortedFixture.component.data.length === 10)
				expect(fetchesOf('stream-sorting').at(-1)).toEqual({ search: 'stream-sorting', page: 1, pageSize: 10 })
				expect(sortedFixture.component.data[0]?.id).toBe(1)
			})
		})
	})

	describe('with infinite scrolling opted out of by default', () => {
		beforeEach(() => FetchableDataGrid.defaultPagination = 'pages')
		afterEach(() => FetchableDataGrid.defaultPagination = undefined)

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'a' } satisfies Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should keep navigating pages when only a size is specified', async () => {
			fixture.component.setPagination(50)
			await fixture.component.updateComplete

			expect(fixture.component.resolvedPagination).toEqual({ strategy: 'pages', size: 50 })
			expect(fixture.component.hasInfiniteScroll).toBeFalse()
		})

		it('should navigate pages explicitly', () => {
			expect(fixture.component.hasServerSidePagination).toBeTrue()
			expect(fixture.component.hasInfiniteScroll).toBeFalse()
			expect(fixture.component.hasPagination).toBeTrue()
		})

		it('should page by the persisted page size rather than by the viewport', () => {
			expect(fixture.component.pageSize).toBe(DataGrid.pageSize.value)
		})

		it('should render page navigation and the page-size menu in the footer', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			const footer = fixture.component.renderRoot.querySelector('mo-data-grid-footer')
			await footer?.updateComplete

			expect(footer?.renderRoot.querySelector('mo-icon-button')).not.toBeNull()
			expect(footer?.renderRoot.querySelector('mo-menu')).not.toBeNull()
		})

		it('should fetch only the navigated page instead of streaming further ones', async () => {
			fixture.component.setParameters({ search: 'opted-out' })
			await fixture.component.updateComplete
			await fixture.component.requestFetch()
			await waitUntil(() => fixture.component.data.length > 0)
			const fetchesAfterFirstPage = fetchesOf('opted-out').length

			await new Promise(resolve => setTimeout(resolve, 200))

			expect(fixture.component.data.length).toBe(DataGrid.pageSize.value)
			expect(fetchesOf('opted-out').length).toBe(fetchesAfterFirstPage)
		})

		it('should fetch the newly navigated page with its pagination parameters when setPage is called', async () => {
			fixture.component.setParameters({ search: 'set-page' })
			await fixture.component.updateComplete
			await fixture.component.requestFetch()
			expect(fetchesOf('set-page').at(-1)).toEqual({ search: 'set-page', page: 1, pageSize: DataGrid.pageSize.value })
			const fetchesOfTheFirstPage = fetchesOf('set-page').length

			fixture.component.setPage(2)

			await waitUntil(() => fetchesOf('set-page').length > fetchesOfTheFirstPage)
			await waitUntil(() => fixture.component.data[0]?.id === 11)
			expect(fetchesOf('set-page').at(-1)).toEqual({ search: 'set-page', page: 2, pageSize: DataGrid.pageSize.value })
			expect(fixture.component.data.length).toBe(DataGrid.pageSize.value)
		})
	})

	describe('infinite scrolling in a laid out grid', () => {
		beforeEach(() => DataGrid.pageSize.value = 2)

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'infinite-laid-out' } satisfies Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should keep loading pages until the visible area is filled and stop thereafter', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			await waitUntil(() => fixture.component.infiniteScrollController.pending === false
				&& fixture.component.data.length > 2)

			const filled = fixture.component.data.length
			expect(filled).toBeGreaterThan(2)
			expect(filled).toBeLessThan(total)

			await new Promise(resolve => setTimeout(resolve, 200))
			expect(fixture.component.data.length).toBe(filled)
		})
	})

	describe('infinite scrolling with a failing page', () => {
		beforeEach(() => {
			DataGrid.pageSize.value = 2
			failFromPage = 2
		})

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'failing' } satisfies Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		const indicator = () => fixture.component.renderRoot.querySelector('#infinite-scroll-indicator')

		it('should offer a retry instead of requesting the failed page over and over again', async () => {
			await waitUntil(() => fixture.component.infiniteScrollController.error !== undefined)
			await fixture.component.updateComplete

			expect(fixture.component.data.length).toBe(2)
			expect(indicator()?.querySelector('mo-icon-button')).toBeTruthy()

			const fetchesAfterFailure = fetchesOf('failing').length
			await new Promise(resolve => setTimeout(resolve, 300))
			expect(fetchesOf('failing').length).toBe(fetchesAfterFailure)
		})

		it('should resume the stream when the retry succeeds', async () => {
			await waitUntil(() => fixture.component.infiniteScrollController.error !== undefined)
			await fixture.component.updateComplete

			failFromPage = Number.POSITIVE_INFINITY
			indicator()?.querySelector<HTMLElement>('mo-icon-button')?.click()

			await waitUntil(() => fixture.component.data.length > 2)
			await waitUntil(() => fixture.component.infiniteScrollController.pending === false)
			await fixture.component.updateComplete

			expect(fixture.component.infiniteScrollController.error).toBeUndefined()
			expect(indicator()).toBeNull()
		})
	})
	describe('infinite scrolling with autoRefetch', () => {
		useVirtualTime()

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 0px'
				.parameters=${{ search: 'a' } satisfies Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		afterEach(() => fixture.component.autoRefetch = undefined)

		it('should silently restore the stream to its loaded extent on each tick', async () => {
			fixture.component.setParameters({ search: 'auto-refetch' })
			await fixture.component.updateComplete
			await settle(fixture.component.requestFetch())
			await settle(fixture.component.fetcherController.fetchNextPage())
			const scrollToStart = spyOn(fixture.component.infiniteScrollController, 'scrollToStart')
			const fetchesBeforeTick = fetchesOf('auto-refetch').length
			let handedOverFetchCount = 0
			fixture.component.addEventListener('dataFetch', () => handedOverFetchCount++)

			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete
			await advanceUntil(() => fetchesOf('auto-refetch').length > fetchesBeforeTick && handedOverFetchCount > 0)

			expect(fetchesOf('auto-refetch').at(-1)).toEqual({ search: 'auto-refetch', page: 1, pageSize: 20 })
			expect(fixture.component.data.length).toBe(20)
			expect(fixture.component.data.at(-1)?.id).toBe(20)
			expect(scrollToStart).not.toHaveBeenCalled()
		})

		it('should stop refetching once the grid is disconnected', async () => {
			fixture.component.setParameters({ search: 'disconnect' })
			await fixture.component.updateComplete
			await settle(fixture.component.requestFetch())
			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete

			fixture.component.remove()
			const fetchesAfterDisconnection = fetchesOf('disconnect').length
			await advance(1200)

			expect(fetchesOf('disconnect').length).toBe(fetchesAfterDisconnection)
		})
	})

	describe('autoRefetch', () => {
		useVirtualTime()

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'auto' } satisfies Parameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		afterEach(() => fixture.component.autoRefetch = undefined)

		it('should refetch silently at the configured interval', async () => {
			fixture.component.setParameters({ search: 'auto-interval' })
			await fixture.component.updateComplete
			await settle(fixture.component.requestFetch())
			const fetchesBeforeTick = fetchesOf('auto-interval').length
			let silentOnHandover: boolean | undefined
			fixture.component.addEventListener('dataFetch', () => silentOnHandover ??= fixture.component.fetcherController.silent)

			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete

			await advanceUntil(() => fetchesOf('auto-interval').length > fetchesBeforeTick && silentOnHandover !== undefined)
			expect(silentOnHandover).toBeTrue()
		})

		it('should skip a tick while a fetch is still pending instead of overlapping requests', async () => {
			fixture.component.fetch = deferredFetch
			fixture.component.setParameters({ search: 'auto-pending' })
			await advanceUntil(() => deferredFetches.length === 1 && fixture.component.fetcherController.pending)

			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete
			await advance(2500)

			expect(deferredFetches.length).toBe(1)

			deferredFetches[0]!.resolve(people(1))
		})

		it('should stop refetching when autoRefetch is cleared', async () => {
			fixture.component.setParameters({ search: 'auto-cleared' })
			await fixture.component.updateComplete
			await settle(fixture.component.requestFetch())
			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete
			await advanceUntil(() => fetchesOf('auto-cleared').length >= 2)

			fixture.component.autoRefetch = undefined
			await fixture.component.updateComplete
			await advance(700)
			const fetchesAfterClearing = fetchesOf('auto-cleared').length

			await advance(1500)

			expect(fetchesOf('auto-cleared').length).toBe(fetchesAfterClearing)
		})

		it('should restart the interval when autoRefetch changes', async () => {
			fixture.component.setParameters({ search: 'auto-restarted' })
			await fixture.component.updateComplete
			await settle(fixture.component.requestFetch())
			const fetchesBeforeTick = fetchesOf('auto-restarted').length

			fixture.component.autoRefetch = 30
			await fixture.component.updateComplete
			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete

			await advance(2000)

			expect(fetchesOf('auto-restarted').length).toBeGreaterThan(fetchesBeforeTick)
		})
	})

	describe('CSV export', () => {
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'export' } satisfies Parameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should export a plain array result in a single request without server-side pagination', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			const exportFetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(people(7)))
			fixture.component.fetch = exportFetch

			const records = await drain(fixture.component.getCsvData())

			expect(exportFetch).toHaveBeenCalledTimes(1)
			expect(exportFetch.calls.mostRecent().args[0]).toEqual({ search: 'export' })
			expect(records.length).toBe(7)
			expect(records.at(-1)?.data.id).toBe(7)
		})

		describe('with server-side sorting', () => {
			const sortedFixture = new ComponentTestFixture<Grid>(html`
				<mo-fetchable-data-grid style='height: 300px'
					.parameters=${{ search: 'export-sorted' } satisfies Parameters}
					.sortParameters=${() => ({ sortBy: 'name' })}
					.fetch=${fetch}
				></mo-fetchable-data-grid>
			` as any)

			it('should include the current sort parameters in the export requests', async () => {
				await waitUntil(() => sortedFixture.component.data.length > 0)
				const exportFetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve(people(3)))
				sortedFixture.component.fetch = exportFetch

				const records = await drain(sortedFixture.component.getCsvData())

				expect(exportFetch).toHaveBeenCalledTimes(1)
				expect(exportFetch.calls.mostRecent().args[0]).toEqual({ search: 'export-sorted', sortBy: 'name' })
				expect(records.length).toBe(3)
			})
		})
	})

	describe('toolbar refetch button', () => {
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'toolbar' } satisfies Parameters}
				.fetch=${deferredFetch}
			>
				<div slot='toolbar'>Toolbar</div>
			</mo-fetchable-data-grid>
		` as any)

		const button = () => fixture.component.renderRoot.querySelector('mo-fetchable-data-grid-refetch-icon-button')
		const awaitButton = () => waitUntil(() => !!button())

		it('should request a refetch when the toolbar button dispatches requestFetch', async () => {
			await awaitButton()
			const requestFetchSpy = spyOn(fixture.component, 'requestFetch')

			button()!.requestFetch.dispatch()

			expect(requestFetchSpy).toHaveBeenCalledTimes(1)
		})

		it('should keep the toolbar button\'s autoRefetch in sync with the grid\'s (two-way binding)', async () => {
			await awaitButton()

			fixture.component.autoRefetch = 10
			await fixture.component.updateComplete

			expect(button()!.autoRefetch).toBe(10)

			button()!.autoRefetchChange.dispatch(30)
			await fixture.component.updateComplete

			expect(fixture.component.autoRefetch).toBe(30)

			fixture.component.autoRefetch = undefined
		})

		it('should reflect the pending fetch on the toolbar button', async () => {
			await awaitButton()
			await waitUntil(() => deferredFetches.length > 0 && fixture.component.fetcherController.pending)
			await fixture.component.updateComplete
			await button()!.updateComplete

			expect(button()!.fetching).toBeTrue()

			deferredFetches[0]!.resolve(people(2))
			await waitUntil(() => fixture.component.fetcherController.pending === false)
			await fixture.component.updateComplete
			await button()!.updateComplete

			expect(button()!.fetching).toBeFalse()
		})
	})
})