import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid } from '@3mo/data-grid'
import { FetchableDataGrid } from './FetchableDataGrid.js'
import './index.js'

type Person = { id: number, name: string }
type Parameters = { search: string, page?: number, pageSize?: number }
type Grid = FetchableDataGrid<Person, Parameters>

let total = 100
let fetchCount = 0
/**
 * Log of all fetched parameters. Since a spec may end while a throttled fetch of its component is
 * still queued - which then lands mid the following spec - count-based assertions shall be scoped
 * to a spec-unique `search` via @see fetchesOf instead of relying on the global count.
 */
let fetches = new Array<{ search?: string, page: number, pageSize: number }>()
const fetchesOf = (search: string) => fetches.filter(parameters => parameters.search === search)
let failFromPage = Number.POSITIVE_INFINITY
/** Whether the results report the end of the data via a total `dataLength` or a `hasNextPage` flag. */
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

const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
	const start = performance.now()
	while (condition() === false) {
		if (performance.now() - start > timeoutInMilliseconds) {
			throw new Error('The condition has not been met in time.')
		}
		await new Promise(resolve => setTimeout(resolve, 10))
	}
}

describe('FetchableDataGrid', () => {
	const defaultPageSize = DataGrid.pageSize.value

	beforeEach(() => {
		total = 100
		fetchCount = 0
		fetches = []
		failFromPage = Number.POSITIVE_INFINITY
		resultShape = 'dataLength'
		DataGrid.pageSize.value = 10
	})

	afterEach(() => DataGrid.pageSize.value = defaultPageSize)

	describe('infinite scrolling', () => {
		// A grid without a height keeps the controller idle, which makes the pages deterministic.
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
				// The application default fills the strategy only, so the size still comes from the class fallback.
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
			// While streaming, the size menu chooses the size of the chunks instead of that of a page.
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
			// The export fetches on its own and leaves the stream untouched.
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

			// The page of the superseded stream must not reappear at the end of the new one.
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
			// The update is flushed first so that the parameters' auto-triggered run precedes the awaited
			// one in the throttle batch - the throttler resolves only the batch's last run - which in turn
			// resolves only once the fetched data has also been handed over.
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
			await waitUntil(() => fixture.component.data.length > 0)
			const fetchesAfterFirstPage = fetchCount

			await new Promise(resolve => setTimeout(resolve, 200))

			expect(fixture.component.data.length).toBe(DataGrid.pageSize.value)
			expect(fetchCount).toBe(fetchesAfterFirstPage)
		})
	})

	describe('infinite scrolling in a laid out grid', () => {
		beforeEach(() => DataGrid.pageSize.value = 2)

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'a' } satisfies Parameters}
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

			// Nothing else is loaded as long as the user does not scroll.
			await new Promise(resolve => setTimeout(resolve, 200))
			expect(fixture.component.data.length).toBe(filled)
		})
	})

	describe('infinite scrolling with a failing page', () => {
		// Registered before the fixture's own hook, so the failure is in place before the first page is fetched.
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
			await fixture.component.requestFetch()
			await fixture.component.fetcherController.fetchNextPage()
			const scrollToStart = spyOn(fixture.component.infiniteScrollController, 'scrollToStart')
			const fetchesBeforeTick = fetchesOf('auto-refetch').length
			let handedOverFetchCount = 0
			fixture.component.addEventListener('dataFetch', () => handedOverFetchCount++)

			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete
			await waitUntil(() => fetchesOf('auto-refetch').length > fetchesBeforeTick && handedOverFetchCount > 0)

			expect(fetchesOf('auto-refetch').at(-1)).toEqual({ search: 'auto-refetch', page: 1, pageSize: 20 })
			expect(fixture.component.data.length).toBe(20)
			expect(fixture.component.data.at(-1)?.id).toBe(20)
			expect(scrollToStart).not.toHaveBeenCalled()
		})

		it('should stop refetching once the grid is disconnected', async () => {
			fixture.component.setParameters({ search: 'disconnect' })
			await fixture.component.updateComplete
			await fixture.component.requestFetch()
			fixture.component.autoRefetch = 1
			await fixture.component.updateComplete

			fixture.component.remove()
			const fetchesAfterDisconnection = fetchesOf('disconnect').length
			await new Promise(resolve => setTimeout(resolve, 1200))

			expect(fetchesOf('disconnect').length).toBe(fetchesAfterDisconnection)
		})
	})
})