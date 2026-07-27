import { DataGridColumnModifications } from './DataGridColumnModifications.js'

type Person = { id: number, name: string }

describe('DataGridColumnModifications', () => {
	it('should express no intent initially', () => {
		const modifications = new DataGridColumnModifications<Person>()

		expect(modifications.length).toBe(0)
		expect([...modifications]).toEqual([])
	})

	it('should replace all modifications when set', () => {
		const modifications = new DataGridColumnModifications<Person>()

		modifications.set([{ dataSelector: 'name', width: '200px' }])
		expect(modifications.map(m => m.dataSelector)).toEqual(['name'])

		modifications.set([{ dataSelector: 'id' }])
		expect(modifications.map(m => m.dataSelector)).toEqual(['id'])
		expect(modifications.length).toBe(1)
		expect(modifications[1]).toBeUndefined()
	})

	it('should clear the modifications when set without any', () => {
		const modifications = new DataGridColumnModifications<Person>()
		modifications.set([{ dataSelector: 'name' }])

		modifications.set()

		expect(modifications.length).toBe(0)
		expect([...modifications]).toEqual([])
	})

	it('should notify when set', () => {
		const updated = jasmine.createSpy()
		const modifications = new DataGridColumnModifications<Person>({ updated })

		modifications.set([{ dataSelector: 'name' }])

		expect(updated).toHaveBeenCalledTimes(1)
	})

	it('should not notify while being constructed', () => {
		const updated = jasmine.createSpy()

		new DataGridColumnModifications<Person>({ updated })

		expect(updated).not.toHaveBeenCalled()
	})

	it('should not be affected by mutations of the given modifications', () => {
		const modifications = new DataGridColumnModifications<Person>()
		const given = [{ dataSelector: 'name' as const }]

		modifications.set(given)
		given.push({ dataSelector: 'id' } as never)

		expect(modifications.map(m => m.dataSelector)).toEqual(['name'])
	})

	it('should get a modification by data selector', () => {
		const modifications = new DataGridColumnModifications<Person>()
		modifications.set([{ dataSelector: 'name', width: '200px' }, { dataSelector: 'id', hidden: true }])

		expect(modifications.get('name')?.width).toBe('200px')
		expect(modifications.get('id')?.hidden).toBeTrue()
	})

	it('should be array-like and iterable in the order intent is expressed', () => {
		const modifications = new DataGridColumnModifications<Person>()
		modifications.set([{ dataSelector: 'name' }, { dataSelector: 'id' }])

		expect(modifications.length).toBe(2)
		expect(modifications[0]?.dataSelector).toBe('name')
		expect([...modifications].map(m => m.dataSelector)).toEqual(['name', 'id'])
		expect(modifications.findIndex(m => m.dataSelector === 'id')).toBe(1)
		expect(modifications.every(m => !!m.dataSelector)).toBeTrue()
	})
})