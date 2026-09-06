import { component, Component, html, repeat, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ExpandabilityAllState, ExpandabilityController, type ExpandabilityChange } from './ExpandabilityController.js'

type Section = { readonly id: number, readonly title: string, readonly parentId?: number, readonly leaf?: boolean }

const sections: ReadonlyArray<Section> = [
	{ id: 1, title: 'Introduction' },
	{ id: 2, title: 'Chapter 1' },
	{ id: 3, title: 'Section 1.1', parentId: 2 },
	{ id: 4, title: 'Chapter 2' },
	{ id: 5, title: 'Appendix', leaf: true },
]

@component('expandability-test')
class ExpandabilityTest extends Component {
	@state() items: ReadonlyArray<Section> = sections

	multiple = true
	hostOwned = false
	hostExpanded: ReadonlyArray<Section> = []
	stamping = true
	load?: (item: Section) => Promise<unknown>

	readonly changes = new Array<ExpandabilityChange<Section>>()

	readonly controller = new ExpandabilityController<Section, ExpandabilityTest>(this, host => ({
		get items() { return host.items },
		key: section => section.id,
		isExpandable: section => !section.leaf,
		get multiple() { return host.multiple },
		ancestorsOf: section => host.items.filter(candidate => candidate.id === section.parentId),
		get expanded() { return host.hostOwned ? host.hostExpanded : undefined },
		get stamping() { return host.stamping },
		get load() { return host.load },
		handleChange: change => {
			host.changes.push(change)
			if (host.hostOwned) {
				host.hostExpanded = [...change.expanded]
			}
		},
	}))

	get expandedIds() { return this.controller.expanded.map(section => section.id) }
	get elements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('li')] }

	protected override get template() {
		return html`
			<ul>
				${repeat(this.items, section => section.id, (section, index) => html`
					<li ${this.controller.item({ index, data: section })}>${section.title}</li>
				`)}
			</ul>
		`
	}
}

describe('ExpandabilityController', () => {
	const fixture = new ComponentTestFixture<ExpandabilityTest>(html`<expandability-test></expandability-test>`)

	const controller = () => fixture.component.controller
	const section = (id: number) => sections.find(candidate => candidate.id === id)!

	describe('expanding and collapsing', () => {
		it('should start with nothing expanded', () => {
			expect(fixture.component.expandedIds).toEqual([])
			expect(controller().allState).toBe(ExpandabilityAllState.None)
		})

		it('should expand, collapse and toggle by key', async () => {
			await controller().expand(section(2))
			expect(controller().isExpanded({ ...section(2) })).toBe(true)

			controller().collapse({ ...section(2) })
			expect(fixture.component.expandedIds).toEqual([])

			await controller().toggle(section(4))
			expect(fixture.component.expandedIds).toEqual([4])
		})

		it('should refuse items that are not expandable', async () => {
			await controller().expand(section(5))

			expect(fixture.component.expandedIds).toEqual([])
			expect(controller().isExpandable(section(5))).toBe(false)
		})

		it('should keep several items open while multiple', async () => {
			await controller().expand(section(2))
			await controller().expand(section(4))

			expect(fixture.component.expandedIds).toEqual([2, 4])
			expect(controller().allState).toBe(ExpandabilityAllState.Some)
		})

		it('should close the others except the ancestors while single', async () => {
			fixture.component.multiple = false

			await controller().expand(section(2))
			await controller().expand(section(3))
			expect(fixture.component.expandedIds).toEqual([2, 3])

			await controller().expand(section(4))
			expect(fixture.component.expandedIds).toEqual([4])
		})

		it('should report what joined and what left', async () => {
			await controller().expand(section(2))
			await controller().expand(section(4))
			controller().collapse(section(2))

			expect(fixture.component.changes.map(change => [change.added.map(s => s.id), change.removed.map(s => s.id)])).toEqual([
				[[2], []],
				[[4], []],
				[[], [2]],
			])
		})
	})

	describe('all', () => {
		it('should expand and collapse every expandable item', () => {
			controller().expandAll()
			expect(fixture.component.expandedIds).toEqual([1, 2, 3, 4])
			expect(controller().allState).toBe(ExpandabilityAllState.All)

			controller().collapseAll()
			expect(fixture.component.expandedIds).toEqual([])
		})

		it('should toggle everything unless something is already open', async () => {
			controller().toggleAll()
			expect(controller().allState).toBe(ExpandabilityAllState.All)

			controller().collapseAll()
			await controller().expand(section(2))
			controller().toggleAll()
			expect(fixture.component.expandedIds).toEqual([])
		})

		it('should not expand all while single', () => {
			fixture.component.multiple = false

			controller().expandAll()

			expect(fixture.component.expandedIds).toEqual([])
		})
	})

	describe('host-owned state', () => {
		it('should read and commit through the host', async () => {
			fixture.component.hostOwned = true
			fixture.component.hostExpanded = [section(4)]

			expect(controller().isExpanded(section(4))).toBe(true)

			await controller().expand(section(2))

			expect(fixture.component.hostExpanded.map(s => s.id)).toEqual([4, 2])
		})

		it('should assign through the same constraints', () => {
			controller().expanded = [section(5), section(2), { ...section(2) }]

			expect(fixture.component.expandedIds).toEqual([2])
		})
	})

	describe('items change', () => {
		it('should maintain the expanded items by key across replaced instances by default', async () => {
			await controller().expand(section(2))
			fixture.component.items = sections.map(s => ({ ...s }))

			controller().handleItemsChange()

			expect(fixture.component.expandedIds).toEqual([2])
			expect(controller().expanded[0]).toBe(fixture.component.items[1]!)
		})

		it('should drop items that are gone', async () => {
			await controller().expand(section(2))
			fixture.component.items = sections.filter(s => s.id !== 2)

			controller().handleItemsChange()

			expect(fixture.component.expandedIds).toEqual([])
		})

		it('should start closed instead where the owner asks for that outright', async () => {
			await controller().expand(section(2))

			controller().collapseAll()

			expect(fixture.component.expandedIds).toEqual([])
		})
	})

	describe('lazy loading', () => {
		it('should load the children before opening, once, and stamp the loading state meanwhile', async () => {
			let resolve!: () => void
			const load = jasmine.createSpy('load').and.callFake(() => new Promise<void>(r => resolve = r))
			fixture.component.load = load

			const expanding = controller().expand(section(2))
			expect(controller().isLoading(section(2))).toBe(true)
			expect(controller().stateOf(section(2))).toBe('loading')
			expect(fixture.component.elements[1]!.dataset.expandability).toBe('loading')
			expect(controller().isExpanded(section(2))).toBe(false)

			resolve()
			await expanding

			expect(controller().isExpanded(section(2))).toBe(true)
			expect(controller().isLoading(section(2))).toBe(false)

			controller().collapse(section(2))
			await controller().expand(section(2))

			expect(load).toHaveBeenCalledTimes(1)
		})

		it('should stay collapsed and stamp failed when loading rejects', async () => {
			fixture.component.load = () => Promise.reject(new Error('offline'))

			await expectAsync(controller().expand(section(2))).toBeRejected()

			expect(controller().isExpanded(section(2))).toBe(false)
			expect(controller().stateOf(section(2))).toBe('failed')
			expect(fixture.component.elements[1]!.dataset.expandability).toBe('failed')
		})

		it('should only expand loaded items on expandAll', async () => {
			fixture.component.load = () => Promise.resolve()
			await controller().expand(section(2))
			controller().collapse(section(2))

			controller().expandAll()

			expect(fixture.component.expandedIds).toEqual([2])
		})
	})

	describe('stamping', () => {
		it('should stamp the state and aria-expanded on expandable items only', async () => {
			await fixture.updateComplete
			await controller().expand(section(2))

			expect(fixture.component.elements.map(element => element.dataset.expandability)).toEqual(['collapsed', 'expanded', 'collapsed', 'collapsed', undefined])
			expect(fixture.component.elements.map(element => element.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false', 'false', null])
		})

		describe('turned off, for a host which announces expansion itself', () => {
			const unstamped = new ComponentTestFixture<ExpandabilityTest>(html`<expandability-test .stamping=${false}></expandability-test>`)

			it('should touch neither the data attribute nor aria-expanded', async () => {
				await unstamped.component.controller.expand(section(2))
				await unstamped.updateComplete

				expect(unstamped.component.expandedIds).toEqual([2])
				expect(unstamped.component.elements.every(element => !element.dataset.expandability)).toBe(true)
				expect(unstamped.component.elements.every(element => !element.hasAttribute('aria-expanded'))).toBe(true)
			})
		})
	})
})