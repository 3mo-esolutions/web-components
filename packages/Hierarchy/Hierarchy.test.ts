import { Hierarchy } from './Hierarchy.js'

type Folder = { readonly name: string, readonly folders?: Array<Folder>, readonly lazy?: boolean }

const folders: Array<Folder> = [
	{ name: 'Documents', folders: [{ name: 'Taxes', folders: [{ name: '2025' }, { name: '2026' }] }, { name: 'Letters' }] },
	{ name: 'Pictures', folders: [{ name: 'Holidays' }] },
	{ name: 'Music' },
]

describe('Hierarchy', () => {
	let model: Hierarchy<Folder>

	beforeEach(() => {
		model = new Hierarchy<Folder>({ children: folder => folder.folders, key: folder => folder.name, hasChildren: folder => !!folder.lazy })
		model.roots = folders
	})

	const names = (nodes: ReadonlyArray<{ readonly data: Folder }>) => nodes.map(node => node.data.name)

	describe('nodes', () => {
		it('should flatten the hierarchy in pre-order with levels, positions and set sizes', () => {
			expect(names(model.nodes)).toEqual(['Documents', 'Taxes', '2025', '2026', 'Letters', 'Pictures', 'Holidays', 'Music'])
			expect(model.nodes.map(node => node.level)).toEqual([0, 1, 2, 2, 1, 0, 1, 0])
			expect(model.nodes.map(node => node.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
			expect(model.nodes.map(node => node.position)).toEqual([0, 0, 0, 1, 1, 1, 0, 2])
			expect(model.nodes.map(node => node.setSize)).toEqual([3, 2, 2, 2, 2, 3, 1, 3])
		})

		it('should link parents and children', () => {
			const taxes = model.get({ name: 'Taxes' })!

			expect(taxes.parent?.data.name).toBe('Documents')
			expect(names(taxes.children!)).toEqual(['2025', '2026'])
			expect(model.get({ name: 'Music' })!.children).toBeUndefined()
			expect(model.get({ name: 'Music' })!.hasChildren).toBe(false)
		})

		it('should sort every sibling set', () => {
			model = new Hierarchy<Folder>({ children: folder => folder.folders, sort: (a, b) => b.name.localeCompare(a.name) })
			model.roots = folders

			expect(names(model.nodes)).toEqual(['Pictures', 'Holidays', 'Music', 'Documents', 'Taxes', '2026', '2025', 'Letters'])
		})

		it('should be memoised until the roots change', () => {
			const nodes = model.nodes

			expect(model.nodes).toBe(nodes)

			model.roots = [...folders]

			expect(model.nodes).not.toBe(nodes)
			expect(names(model.nodes)).toEqual(names(nodes))
		})

		it('should find a node by key', () => {
			expect(model.get({ name: 'Holidays' })?.level).toBe(1)
			expect(model.get({ name: '2026' })?.parent?.data.name).toBe('Taxes')
			expect(model.get({ name: 'Nothing' })).toBeUndefined()
		})
	})

	describe('visible', () => {
		it('should list only the roots while nothing is expanded', () => {
			expect(names(model.visible({ isExpanded: () => false }))).toEqual(['Documents', 'Pictures', 'Music'])
		})

		it('should descend into expanded nodes only', () => {
			const expanded = new Set<unknown>(['Documents'])

			expect(names(model.visible({ isExpanded: node => expanded.has(node.key) }))).toEqual(['Documents', 'Taxes', 'Letters', 'Pictures', 'Music'])

			expanded.add('Taxes')
			expect(names(model.visible({ isExpanded: node => expanded.has(node.key) }))).toEqual(['Documents', 'Taxes', '2025', '2026', 'Letters', 'Pictures', 'Music'])
		})

		it('should not show the children of an expanded node whose parent is collapsed', () => {
			const expanded = new Set<unknown>(['Taxes'])

			expect(names(model.visible({ isExpanded: node => expanded.has(node.key) }))).toEqual(['Documents', 'Pictures', 'Music'])
		})

		it('should leave out what is not included, along with its subtree', () => {
			const visible = model.visible({ isExpanded: () => true, isIncluded: node => node.data.name !== 'Pictures' })

			expect(names(visible)).toEqual(['Documents', 'Taxes', '2025', '2026', 'Letters', 'Music'])
		})

	})

	describe('filter', () => {
		it('should keep a match with its ancestors and its subtree by default', () => {
			const keys = model.filter(folder => folder.name === 'Taxes')

			expect([...keys]).toEqual(['Documents', 'Taxes', '2025', '2026'])
		})

		it('should keep a match with its ancestors alone when asked', () => {
			const keys = model.filter(folder => folder.name === 'Taxes', 'match')

			expect([...keys]).toEqual(['Documents', 'Taxes'])
		})
	})

	describe('relations', () => {
		it('should list ancestors root first and descendants in pre-order', () => {
			const year = model.get({ name: '2026' })!

			expect(names(year.ancestors)).toEqual(['Documents', 'Taxes'])
			expect(names(model.get({ name: 'Documents' })!.descendants)).toEqual(['Taxes', '2025', '2026', 'Letters'])
			expect(names(year.siblings)).toEqual(['2025', '2026'])
			expect(names(model.get({ name: 'Music' })!.siblings)).toEqual(['Documents', 'Pictures', 'Music'])
		})
	})

	describe('lazy children', () => {
		it('should report unloaded children as present, without any', () => {
			model.roots = [{ name: 'Remote', lazy: true }]
			const remote = model.nodes[0]!

			expect(remote.hasChildren).toBe(true)
			expect(model.isLoaded({ name: 'Remote' })).toBe(false)
			expect(remote.children).toBeUndefined()
		})

		it('should take loaded children over the accessor and invalidate', () => {
			model.roots = [{ name: 'Remote', lazy: true }]
			const before = model.nodes

			model.setChildren({ name: 'Remote' }, [{ name: 'Loaded' }])

			expect(model.nodes).not.toBe(before)
			expect(names(model.nodes)).toEqual(['Remote', 'Loaded'])
			expect(model.isLoaded({ name: 'Remote' })).toBe(true)
		})
	})
})