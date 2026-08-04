import { DataGridColumn } from '../index.js'
import { DataGridColumnDefinitions } from './DataGridColumnDefinitions.js'

type Person = { id: number, name: string }

const column = (dataSelector: KeyPath.Of<Person>) => new DataGridColumn<Person>({ dataSelector, heading: dataSelector })

describe('DataGridColumnDefinitions', () => {
	describe('sources', () => {
		it('should have no definitions without any source', () => {
			const definitions = new DataGridColumnDefinitions<Person>()

			expect(definitions.length).toBe(0)
			expect([...definitions]).toEqual([])
			expect(definitions.extracted).toEqual([])
			expect(definitions.programmatic).toEqual([])
			expect(definitions.generated).toEqual([])
		})

		it('should generate definitions while no other source provides any', () => {
			const generated = [column('id')]

			const definitions = new DataGridColumnDefinitions<Person>({ generate: () => generated })

			expect([...definitions]).toEqual(generated)
			expect(definitions.generated).toEqual(generated)
		})

		it('should let programmatic definitions take precedence over generated ones', () => {
			const definitions = new DataGridColumnDefinitions<Person>({ generate: () => [column('id')] })

			definitions.programmatic = [column('name')]

			expect(definitions.map(c => c.dataSelector)).toEqual(['name'])
			expect(definitions.generated).toEqual([])
		})

		it('should let extracted definitions take precedence over programmatic and generated ones', () => {
			const definitions = new DataGridColumnDefinitions<Person>({ generate: () => [column('id')] })
			definitions.programmatic = [column('name')]

			definitions.extracted = [column('id'), column('name')]

			expect(definitions.map(c => c.dataSelector)).toEqual(['id', 'name'])
			expect(definitions.programmatic.length).toBe(1)
			expect(definitions.generated).toEqual([])
		})

		it('should fall back to a lower precedence source when a higher one becomes empty', () => {
			const definitions = new DataGridColumnDefinitions<Person>({ generate: () => [column('id')] })
			definitions.programmatic = [column('name')]
			definitions.extracted = [column('id')]

			definitions.extracted = []

			expect(definitions.map(c => c.dataSelector)).toEqual(['name'])

			definitions.programmatic = []

			expect(definitions.map(c => c.dataSelector)).toEqual(['id'])
		})

		it('should not be affected by mutations of an assigned array', () => {
			const definitions = new DataGridColumnDefinitions<Person>()
			const extracted = [column('id')]

			definitions.extracted = extracted
			extracted.push(column('name'))

			expect(definitions.map(c => c.dataSelector)).toEqual(['id'])
		})
	})

	describe('update', () => {
		it('should notify when a source is assigned', () => {
			const updated = jasmine.createSpy()
			const definitions = new DataGridColumnDefinitions<Person>({ updated })

			definitions.extracted = [column('id')]

			expect(updated).toHaveBeenCalledTimes(1)
		})

		it('should not notify while being constructed', () => {
			const updated = jasmine.createSpy()

			new DataGridColumnDefinitions<Person>({ updated })

			expect(updated).not.toHaveBeenCalled()
		})

		it('should compose anew and notify when updated explicitly, e.g. after the data changed', () => {
			const updated = jasmine.createSpy()
			let generated = new Array<DataGridColumn<Person>>()
			const definitions = new DataGridColumnDefinitions<Person>({ generate: () => generated, updated })
			expect(definitions.length).toBe(0)

			generated = [column('id')]
			definitions.update()

			expect(definitions.map(c => c.dataSelector)).toEqual(['id'])
			expect(updated).toHaveBeenCalledTimes(1)
		})
	})

	describe('array-likeness', () => {
		const definitions = new DataGridColumnDefinitions<Person>()
		beforeEach(() => definitions.extracted = [column('id'), column('name')])

		it('should be indexable', () => {
			expect(definitions[0]?.dataSelector).toBe('id')
			expect(definitions[1]?.dataSelector).toBe('name')
			expect(definitions[2]).toBeUndefined()
			expect(definitions.length).toBe(2)
		})

		it('should be iterable and spreadable', () => {
			expect([...definitions].map(c => c.dataSelector)).toEqual(['id', 'name'])
			expect(Array.from(definitions).map(c => c.dataSelector)).toEqual(['id', 'name'])

			const [first, second] = definitions
			expect(first?.dataSelector).toBe('id')
			expect(second?.dataSelector).toBe('name')
		})

		it('should be queryable', () => {
			expect(definitions.get('name')?.heading).toBe('name')
			expect(definitions.find(c => c.dataSelector === 'id')?.heading).toBe('id')
			expect(definitions.findIndex(c => c.dataSelector === 'name')).toBe(1)
			expect(definitions.filter(c => c.dataSelector === 'id').length).toBe(1)
			expect(definitions.map(c => c.dataSelector)).toEqual(['id', 'name'])
			expect(definitions.some(c => c.dataSelector === 'name')).toBeTrue()
			expect(definitions.every(c => c.hidden === false)).toBeTrue()
			expect(definitions.at(-1)?.dataSelector).toBe('name')
			expect(definitions.slice(1).map(c => c.dataSelector)).toEqual(['name'])
			expect(definitions.includes(definitions[0]!)).toBeTrue()
			expect(definitions.indexOf(definitions[1]!)).toBe(1)
		})

		it('should not keep stale indices when the definitions shrink', () => {
			definitions.extracted = [column('name')]

			expect(definitions.length).toBe(1)
			expect(definitions[0]?.dataSelector).toBe('name')
			expect(definitions[1]).toBeUndefined()
			expect([...definitions].length).toBe(1)
		})
	})
})