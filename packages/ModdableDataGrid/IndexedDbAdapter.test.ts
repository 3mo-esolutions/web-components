import localForage from 'localforage'
import { IndexedDbAdapter } from './IndexedDbAdapter.js'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'

describe('IndexedDbAdapter', () => {
	const adapter = new IndexedDbAdapter<unknown, any>()

	let keys: Array<string>

	const keyOf = (name: string) => {
		const key = `IndexedDbAdapter.test.${name}.${crypto.randomUUID()}`
		keys.push(key)
		return key
	}

	beforeEach(() => keys = [])

	afterEach(async () => {
		for (const key of keys) {
			await localForage.removeItem(`${key}.Modes`)
			await localForage.removeItem(`${key}.Mode`)
		}
	})

	const mode = (id: string, name: string) => new ModdableDataGridMode<unknown, any>({ id, name, parameters: {} })

	it('should round-trip a saved mode as a ModdableDataGridMode instance, reviving DateTime and DateTimeRange parameters', async () => {
		const key = keyOf('round-trip')
		await adapter.save(key, new ModdableDataGridMode<unknown, any>({
			id: '1',
			name: 'Mode 1',
			parameters: {
				date: '2021-01-01T00:00:00.000Z',
				range: new DateTimeRange(new DateTime('2021-01-01T00:00:00.000Z'), new DateTime('2021-01-02T00:00:00.000Z')),
			},
		}))

		const [restored] = await adapter.getAll(key)

		expect(restored).toBeInstanceOf(ModdableDataGridMode)
		expect(restored!.name).toBe('Mode 1')
		const date = restored!.parameters!.date as Date
		expect(date).toBeInstanceOf(Date)
		expect(date.toISOString()).toBe('2021-01-01T00:00:00.000Z')
		const range = restored!.parameters!.range as DateTimeRange
		expect(range).toBeInstanceOf(DateTimeRange)
		expect(range.start?.toISOString()).toBe('2021-01-01T00:00:00.000Z')
		expect(range.end?.toISOString()).toBe('2021-01-02T00:00:00.000Z')
	})

	it('should prepend a new mode and replace an existing one by id on save', async () => {
		const key = keyOf('save')

		await adapter.save(key, mode('1', 'First'))
		await adapter.save(key, mode('2', 'Second'))

		expect((await adapter.getAll(key)).map(m => m.id)).toEqual(['2', '1'])

		await adapter.save(key, mode('1', 'Renamed'))
		const modes = await adapter.getAll(key)

		expect(modes.map(m => m.id)).toEqual(['2', '1'])
		expect(modes.map(m => m.name)).toEqual(['Second', 'Renamed'])
	})

	it('should delete a mode by id', async () => {
		const key = keyOf('delete')
		await adapter.save(key, mode('1', 'First'))
		await adapter.save(key, mode('2', 'Second'))

		await adapter.delete(key, mode('1', 'Some other name'))

		expect((await adapter.getAll(key)).map(m => m.id)).toEqual(['2'])
		expect(await adapter.get(key, '1')).toBeUndefined()
		expect((await adapter.get(key, '2'))?.name).toBe('Second')
	})

	it('should round-trip the selected mode id', async () => {
		const key = keyOf('selected')

		expect(await adapter.getSelectedId(key)).toBeUndefined()

		await adapter.setSelectedId(key, '2')
		expect(await adapter.getSelectedId(key)).toBe('2')

		await adapter.setSelectedId(key, undefined)
		expect(await adapter.getSelectedId(key)).toBeUndefined()
	})

	it('should isolate the modes of different data grid keys', async () => {
		const [first, second] = [keyOf('first-grid'), keyOf('second-grid')]

		await adapter.save(first, mode('1', 'Of the first grid'))
		await adapter.save(second, mode('1', 'Of the second grid'))
		await adapter.setSelectedId(first, '1')

		expect((await adapter.getAll(first)).map(m => m.name)).toEqual(['Of the first grid'])
		expect((await adapter.getAll(second)).map(m => m.name)).toEqual(['Of the second grid'])
		expect(await adapter.getSelectedId(first)).toBe('1')
		expect(await adapter.getSelectedId(second)).toBeUndefined()
	})
})