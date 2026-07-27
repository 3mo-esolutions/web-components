import { DataGridColumn } from '../index.js'
import { DataGridColumns } from './DataGridColumns.js'

type Person = { id: number, name: string, balance: number }

const column = (dataSelector: KeyPath.Of<Person>) => new DataGridColumn<Person>({ dataSelector, heading: dataSelector })

const columnsWith = (...dataSelectors: Array<KeyPath.Of<Person>>) => {
	const columns = new DataGridColumns<Person>()
	columns.definitions.extracted = dataSelectors.map(column)
	return columns
}

describe('DataGridColumns', () => {
	it('should be composed of its definitions and modifications', () => {
		const columns = new DataGridColumns<Person>()

		expect(columns.definitions.length).toBe(0)
		expect(columns.modifications.length).toBe(0)
		expect([...columns]).toEqual([])
	})

	it('should be its definitions while no intent is expressed', () => {
		const columns = columnsWith('id', 'name')

		expect(columns.map(c => c.dataSelector)).toEqual(['id', 'name'])
		expect([...columns]).toEqual([...columns.definitions])
	})

	describe('composition', () => {
		it('should apply modifications in their order and append unmentioned definitions', () => {
			const columns = columnsWith('id', 'name', 'balance')

			columns.modifications.set([{ dataSelector: 'name', width: '200px', hidden: true }])

			expect(columns.map(c => c.dataSelector)).toEqual(['name', 'id', 'balance'])
			expect(columns[0]?.width).toBe('200px')
			expect(columns[0]?.hidden).toBeTrue()
			expect(columns[1]?.width).toBe('max-content')
			expect(columns[1]?.hidden).toBeFalse()
		})

		it('should follow the definition for fields a modification leaves undefined', () => {
			const columns = new DataGridColumns<Person>()
			columns.definitions.extracted = [new DataGridColumn<Person>({ dataSelector: 'id', heading: 'Id', width: '80px', sticky: 'start' })]

			columns.modifications.set([{ dataSelector: 'id', hidden: true }])

			expect(columns[0]?.width).toBe('80px')
			expect(columns[0]?.sticky).toBe('start')
			expect(columns[0]?.hidden).toBeTrue()
		})

		it('should let a modification pin a column as not sticky through null', () => {
			const columns = new DataGridColumns<Person>()
			columns.definitions.extracted = [new DataGridColumn<Person>({ dataSelector: 'id', heading: 'Id', sticky: 'start' })]

			columns.modifications.set([{ dataSelector: 'id', sticky: null }])

			expect(columns[0]?.sticky).toBeUndefined()
		})

		it('should skip modifications without a definition while keeping them', () => {
			const columns = columnsWith('id')

			columns.modifications.set([{ dataSelector: 'balance', width: '321px' }, { dataSelector: 'id' }])

			expect(columns.map(c => c.dataSelector)).toEqual(['id'])
			expect(columns.modifications.length).toBe(2)
		})

		it('should apply a kept modification as soon as its definition appears', () => {
			const columns = columnsWith('id')
			columns.modifications.set([{ dataSelector: 'balance', width: '321px' }, { dataSelector: 'id' }])

			columns.definitions.extracted = [column('id'), column('balance')]

			expect(columns.map(c => c.dataSelector)).toEqual(['balance', 'id'])
			expect(columns.get('balance')?.width).toBe('321px')
		})

		it('should keep the expressed intent when the definitions change', () => {
			const columns = columnsWith('id', 'name')
			columns.modifications.set([{ dataSelector: 'name', width: '200px' }])

			columns.definitions.extracted = [column('id'), new DataGridColumn<Person>({ dataSelector: 'name', heading: 'Full Name' })]

			expect(columns[0]?.heading).toBe('Full Name')
			expect(columns[0]?.width).toBe('200px')
		})

		it('should not mutate the definitions when applying modifications', () => {
			const columns = columnsWith('id')
			const definition = columns.definitions[0]!

			columns.modifications.set([{ dataSelector: 'id', hidden: true }])

			expect(columns[0]?.hidden).toBeTrue()
			expect(definition.hidden).toBeFalse()
			expect(columns[0]).not.toBe(definition)
		})

		it('should prepare each composed column', () => {
			const prepare = jasmine.createSpy()
			const columns = new DataGridColumns<Person>({ prepare })

			columns.definitions.extracted = [column('id'), column('name')]

			expect(prepare).toHaveBeenCalledTimes(2)
			expect(prepare).toHaveBeenCalledWith(columns[0]!)
		})
	})

	describe('modify', () => {
		it('should record the modification of a column', () => {
			const columns = columnsWith('id', 'name')

			columns.modify('id', { hidden: true })

			expect(columns.get('id')?.hidden).toBeTrue()
			expect(columns.modifications.get('id')?.hidden).toBeTrue()
		})

		it('should materialize the order of all columns, as modifying one implies intent about the order', () => {
			const columns = columnsWith('id', 'name')

			columns.modify('name', { width: '200px' })

			expect(columns.modifications.map(m => m.dataSelector)).toEqual(['id', 'name'])
			expect(columns.map(c => c.dataSelector)).toEqual(['id', 'name'])
		})

		it('should merge into an existing modification of the same column', () => {
			const columns = columnsWith('id')

			columns.modify('id', { width: '200px' })
			columns.modify('id', { hidden: true })

			expect(columns.modifications.length).toBe(1)
			expect(columns.modifications.get('id')).toEqual({ dataSelector: 'id', width: '200px', hidden: true })
		})

		it('should keep modifications of columns without a definition', () => {
			const columns = columnsWith('id')
			columns.modifications.set([{ dataSelector: 'balance', width: '321px' }, { dataSelector: 'id' }])

			columns.modify('id', { hidden: true })

			expect(columns.modifications.get('balance')?.width).toBe('321px')
		})

		it('should notify', () => {
			const updated = jasmine.createSpy()
			const columns = new DataGridColumns<Person>({ updated })
			columns.definitions.extracted = [column('id')]
			updated.calls.reset()

			columns.modify('id', { hidden: true })

			expect(updated).toHaveBeenCalledTimes(1)
		})
	})

	describe('move', () => {
		it('should move a column to the given index', () => {
			const columns = columnsWith('id', 'name', 'balance')

			columns.move('balance', 0)

			expect(columns.map(c => c.dataSelector)).toEqual(['balance', 'id', 'name'])
			expect(columns.modifications.map(m => m.dataSelector)).toEqual(['balance', 'id', 'name'])
		})

		it('should keep the presentation modifications of the moved column', () => {
			const columns = columnsWith('id', 'name')
			columns.modify('name', { width: '200px' })

			columns.move('name', 0)

			expect(columns.map(c => c.dataSelector)).toEqual(['name', 'id'])
			expect(columns.get('name')?.width).toBe('200px')
		})

		it('should do nothing for a column which does not exist', () => {
			const columns = columnsWith('id', 'name')

			columns.move('balance', 0)

			expect(columns.map(c => c.dataSelector)).toEqual(['id', 'name'])
			expect(columns.modifications.length).toBe(0)
		})
	})

	describe('visible', () => {
		it('should be the columns which are not hidden', () => {
			const columns = columnsWith('id', 'name')

			columns.modify('id', { hidden: true })

			expect(columns.visible.map(c => c.dataSelector)).toEqual(['name'])
			expect(columns.length).toBe(2)
		})
	})

	describe('update', () => {
		it('should compose anew and notify', () => {
			const updated = jasmine.createSpy()
			let generated = new Array<DataGridColumn<Person>>()
			const columns = new DataGridColumns<Person>({ generate: () => generated, updated })
			expect(columns.length).toBe(0)

			generated = [column('id')]
			columns.update()

			expect(columns.map(c => c.dataSelector)).toEqual(['id'])
			expect(updated).toHaveBeenCalledTimes(1)
		})

		it('should not notify while being constructed', () => {
			const updated = jasmine.createSpy()

			new DataGridColumns<Person>({ generate: () => [column('id')], updated })

			expect(updated).not.toHaveBeenCalled()
		})
	})
})