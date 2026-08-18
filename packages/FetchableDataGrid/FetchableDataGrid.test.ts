import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { DataGrid } from '@3mo/data-grid'
import { type FetchableDataGrid } from './FetchableDataGrid.js'
import './index.js'

type Person = { id: number, name: string }
type Parameters = { search: string, page?: number, pageSize?: number }
type Grid = FetchableDataGrid<Person, Parameters>

let total = 100
let fetchCount = 0
let failFromPage = Number.POSITIVE_INFINITY
/** Whether the results report the end of the data via a total `dataLength` or a `hasNextPage` flag. */
let resultShape: 'dataLength' | 'hasNextPage' = 'dataLength'

const people = (count: number) => new Array(count).fill(undefined).map((_, index) => ({ id: index + 1, name: `Person ${index + 1}` }))

const fetch = ({ page = 1, pageSize = 10 }: Parameters) => {
	fetchCount++
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
		failFromPage = Number.POSITIVE_INFINITY
		resultShape = 'dataLength'
		DataGrid.pageSize.value = 10
	})

	afterEach(() => DataGrid.pageSize.value = defaultPageSize)

	describe('infinite scrolling', () => {
		// A grid without a height keeps the controller idle, which makes the pages deterministic.
		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 0px'
				.parameters=${{ search: 'a' } as Parameters}
				.paginationParameters=${paginationParameters}
				.fetch=${fetch}
			></mo-fetchable-data-grid>
		` as any)

		it('should be the default for server-side pagination', () => {
			expect(fixture.component.hasInfiniteScroll).toBeTrue()
		})

		it('should be opted out of by setting a pagination', async () => {
			fixture.component.pagination = 25
			await fixture.component.updateComplete

			expect(fixture.component.hasInfiniteScroll).toBeFalse()
		})

		it('should not be enabled without server-side pagination', async () => {
			fixture.component.paginationParameters = undefined
			await fixture.component.updateComplete

			expect(fixture.component.hasInfiniteScroll).toBeFalse()
		})

		it('should replace the footer\'s page navigation and page-size menu with a plain count', async () => {
			await waitUntil(() => fixture.component.data.length > 0)
			const footer = () => fixture.component.renderRoot.querySelector('mo-data-grid-footer')
			await footer()?.updateComplete

			expect(fixture.component.hasPagination).toBeTrue()
			expect(footer()?.renderRoot.querySelector('mo-icon-button')).toBeNull()
			expect(footer()?.renderRoot.querySelector('mo-menu')).toBeNull()

			fixture.component.pagination = 25
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
	})

	describe('infinite scrolling in a laid out grid', () => {
		beforeEach(() => DataGrid.pageSize.value = 2)

		const fixture = new ComponentTestFixture<Grid>(html`
			<mo-fetchable-data-grid style='height: 300px'
				.parameters=${{ search: 'a' } as Parameters}
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
				.parameters=${{ search: 'a' } as Parameters}
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

			const fetchesAfterFailure = fetchCount
			await new Promise(resolve => setTimeout(resolve, 300))
			expect(fetchCount).toBe(fetchesAfterFailure)
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
})