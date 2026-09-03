import { PureEventDispatcher } from '@a11d/lit'
import { DataGridSortingController, DataGridSortingStrategy } from './DataGridSortingController'

type Data = { id: number, name: string }

describe('DataGridSortingController', () => {
	let controller: DataGridSortingController<Data>
	beforeEach(() => controller = new DataGridSortingController({
		sortingChange: new PureEventDispatcher()
	}))

	afterEach(() => window.dispatchEvent(new KeyboardEvent('keyup', { ctrlKey: false })))

	const data = [
		{ id: 1, name: 'Darlene' },
		{ id: 2, name: 'Elliot' },
		{ id: 3, name: 'Clarke' },
		{ id: 4, name: 'Darlene' },
		{ id: 5, name: 'Harry' },
	]

	describe('enabled', () => {
		it('should be false when no sorting is defined', () => {
			expect(controller.enabled).toBeFalse()
		})

		it('should be true when sorting is defined', () => {
			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })
			expect(controller.enabled).toBeTrue()
		})

		it('should be false after resetting, since an empty sorting array means no sorting', () => {
			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })
			controller.reset()
			expect(controller.enabled).toBeFalse()
		})
	})

	describe('get', () => {
		it('should initialize with no sorting', () => {
			expect(controller.get()).toEqual([])
		})
	})

	describe('sort', () => {
		it('should sort by provided selector and strategy', () => {
			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })

			expect(controller.get()).toEqual([{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
		})

		it('should accept multiple selectors and rank them', () => {
			controller.set([
				{ selector: 'id', strategy: DataGridSortingStrategy.Descending },
				{ selector: 'name', strategy: DataGridSortingStrategy.Ascending },
			])

			expect(controller.get()).toEqual([
				{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 },
				{ selector: 'name', strategy: DataGridSortingStrategy.Ascending, rank: 2 },
			])
		})

		it('should dispatch sortingChange event', () => {
			spyOn(controller.host.sortingChange!, 'dispatch')

			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })

			expect(controller.host.sortingChange!.dispatch).toHaveBeenCalledWith([{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
		})
	})

	describe('unsort', () => {
		it('should unsort', () => {
			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })
			controller.reset()

			expect(controller.get()).toEqual([])
		})
	})

	describe('toggle', () => {
		it('should toggle sorting strategy', () => {
			controller.toggle('id')
			expect(controller.get()).toEqual([{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 }])

			controller.toggle('id')
			expect(controller.get()).toEqual([{ selector: 'id', strategy: DataGridSortingStrategy.Ascending, rank: 1 }])

			controller.toggle('id')
			expect(controller.get()).toEqual([])
		})

		it('should select multiple sorting strategies if any modifier key is pressed', () => {
			controller.toggle('id')
			window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true }))
			controller.toggle('name')

			expect(controller.get()).toEqual([
				{ selector: 'id', strategy: DataGridSortingStrategy.Descending, rank: 1 },
				{ selector: 'name', strategy: DataGridSortingStrategy.Descending, rank: 2 },
			])
		})

		it('should replace the current sorting when a strategy is forced without a modifier', () => {
			controller.set([
				{ selector: 'id', strategy: DataGridSortingStrategy.Descending },
				{ selector: 'name', strategy: DataGridSortingStrategy.Ascending },
			])

			controller.toggle('name', DataGridSortingStrategy.Descending)

			expect(controller.get()).toEqual([{ selector: 'name', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
		})

		it('should switch an existing descending sorting to ascending with a modifier held', () => {
			controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })
			window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true }))

			controller.toggle('id')

			expect(controller.get()).toEqual([{ selector: 'id', strategy: DataGridSortingStrategy.Ascending, rank: 1 }])
		})

		it('should remove the sorting with a modifier held once toggled past ascending', () => {
			controller.set([
				{ selector: 'id', strategy: DataGridSortingStrategy.Ascending },
				{ selector: 'name', strategy: DataGridSortingStrategy.Descending },
			])
			window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true }))

			controller.toggle('id')

			expect(controller.get()).toEqual([{ selector: 'name', strategy: DataGridSortingStrategy.Descending, rank: 1 }])
		})
	})

	describe('toSorted', () => {
		describe('single sorting', () => {
			it('should sort using ascending strategy', () => {
				controller.set({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })

				expect(controller.toSorted(data)).toEqual([
					{ id: 3, name: 'Clarke' },
					jasmine.objectContaining({ name: 'Darlene' }),
					jasmine.objectContaining({ name: 'Darlene' }),
					{ id: 2, name: 'Elliot' },
					{ id: 5, name: 'Harry' },
				])
			})

			it('should sort using descending strategy', () => {
				controller.set({ selector: 'name', strategy: DataGridSortingStrategy.Descending })

				expect(controller.toSorted(data)).toEqual([
					{ id: 5, name: 'Harry' },
					{ id: 2, name: 'Elliot' },
					jasmine.objectContaining({ name: 'Darlene' }),
					jasmine.objectContaining({ name: 'Darlene' }),
					{ id: 3, name: 'Clarke' },
				])
			})

			it('should treat missing values as greatest, as they compare as Infinity', () => {
				const withMissingValues = () => [
					{ id: 2, name: 'Second' },
					{ id: undefined as unknown as number, name: 'Missing' },
					{ id: 1, name: 'First' },
				]

				controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Ascending })
				expect(controller.toSorted(withMissingValues()).map(d => d.name)).toEqual(['First', 'Second', 'Missing'])

				controller.set({ selector: 'id', strategy: DataGridSortingStrategy.Descending })
				expect(controller.toSorted(withMissingValues()).map(d => d.name)).toEqual(['Missing', 'Second', 'First'])
			})
		})

		describe('multiple sorting', () => {
			it('should sort using ascending strategy', () => {
				controller.set({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })
				window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true }))
				controller.toggle('id', DataGridSortingStrategy.Ascending)

				expect(controller.toSorted(data)).toEqual([
					{ id: 3, name: 'Clarke' },
					{ id: 1, name: 'Darlene' },
					{ id: 4, name: 'Darlene' },
					{ id: 2, name: 'Elliot' },
					{ id: 5, name: 'Harry' },
				])
			})

			it('should sort using descending strategy', () => {
				controller.set({ selector: 'name', strategy: DataGridSortingStrategy.Descending })
				window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true }))
				controller.toggle('id', DataGridSortingStrategy.Descending)

				expect(controller.toSorted(data)).toEqual([
					{ id: 5, name: 'Harry' },
					{ id: 2, name: 'Elliot' },
					{ id: 4, name: 'Darlene' },
					{ id: 1, name: 'Darlene' },
					{ id: 3, name: 'Clarke' },
				])
			})
		})
	})

	describe('toSortedBy', () => {
		it('should sort by the extractor\'s result, as records wrap the data they are sorted by', () => {
			controller.set({ selector: 'name', strategy: DataGridSortingStrategy.Ascending })
			const names = data.map(d => d.name)

			const sorted = controller.toSortedBy(data.map(d => ({ data: d })), record => record.data)

			expect(sorted.map(record => record.data.name)).toEqual(['Clarke', 'Darlene', 'Darlene', 'Elliot', 'Harry'])
			expect(controller.toSortedBy(data.map(d => ({ data: d })), record => record as any).map(record => record.data.name)).toEqual(names)
		})
	})
})