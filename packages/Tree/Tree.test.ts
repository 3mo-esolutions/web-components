import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { TreeItem } from './TreeItem.js'
import './index.js'
import { type Tree } from './Tree.js'

describe('Tree', () => {
	const fixture = new ComponentTestFixture<Tree>(html`
		<mo-tree selectability='single'>
			<mo-tree-item value='documents' open>
				Documents
				<mo-tree-item value='taxes'>
					Taxes
					<mo-tree-item value='2025.pdf'>2025.pdf</mo-tree-item>
				</mo-tree-item>
				<mo-tree-item value='letters' disabled>Letters</mo-tree-item>
			</mo-tree-item>
			<mo-tree-item value='readme'>Readme.txt</mo-tree-item>
		</mo-tree>
	`)

	const items = () => [...fixture.component.querySelectorAll<TreeItem>('mo-tree-item')]
	const item = (value: string) => items().find(item => item.value === value)!
	const click = (item: TreeItem, part: 'row' | 'indicator') =>
		item.renderRoot.querySelector<HTMLElement>(`[part=${part}]`)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

	it('should read the hierarchy from the nesting, and place a nested item in the group of the item above it', () => {
		expect(fixture.component.role).toBe('tree')
		expect(items().map(item => item.getAttribute('role'))).toEqual(['treeitem', 'treeitem', null, 'treeitem', 'treeitem'])
		expect(item('taxes').slot).toBe('children')
		expect(item('taxes').getAttribute('aria-level')).toBe('2')
		expect(item('readme').getAttribute('aria-level')).toBe('1')
	})

	it('should start from the state the markup declares', () => {
		expect(item('documents').open).toBe(true)
		expect(item('documents').getAttribute('aria-expanded')).toBe('true')
		expect(item('letters').getAttribute('aria-disabled')).toBe('true')
		expect(item('readme').hasAttribute('aria-expanded')).toBe(false)
	})

	it('should hold the selection as the value of the item, and write it back onto the item', async () => {
		const change = spyOn(fixture.component.change, 'dispatch')

		click(item('taxes'), 'row')
		await fixture.updateComplete

		expect(fixture.component.value).toBe('taxes')
		expect(change).toHaveBeenCalledWith('taxes')
		expect(item('taxes').getAttribute('aria-selected')).toBe('true')
		expect(item('taxes').selected).toBe(true)
		expect(item('taxes').open).toBe(false)
	})

	it('should hold a multiple selection as an array of values', async () => {
		fixture.component.selectability = 'multiple' as never
		await fixture.updateComplete

		click(item('readme'), 'row')
		fixture.component.controller.selectability.select(item('taxes'), { preserve: true })
		await fixture.updateComplete

		expect(fixture.component.value).toEqual(['readme', 'taxes'])
		expect(fixture.component.hasAttribute('aria-multiselectable')).toBe(true)
	})

	it('should close the item it belongs to, which reports it itself', async () => {
		const openChange = spyOn(item('documents').openChange, 'dispatch')

		click(item('documents'), 'indicator')
		await fixture.updateComplete

		expect(item('documents').open).toBe(false)
		expect(item('documents').getAttribute('aria-expanded')).toBe('false')
		expect(openChange).toHaveBeenCalledWith(false)
	})

	it('should open and close every item that can be', async () => {
		fixture.component.expandAll()
		await fixture.updateComplete

		expect(items().filter(item => item.open).map(item => item.value)).toEqual(['documents', 'taxes'])

		fixture.component.collapseAll()
		await fixture.updateComplete

		expect(items().filter(item => item.open)).toEqual([])
		expect(fixture.component.controller.visible.length).toBe(2)
	})

	it('should select and deselect every item on screen', async () => {
		fixture.component.selectability = 'multiple' as never
		await fixture.updateComplete

		fixture.component.selectAll()
		await fixture.updateComplete

		expect(fixture.component.value).toEqual(['documents', 'taxes', 'readme'])

		fixture.component.deselectAll()
		await fixture.updateComplete

		expect(fixture.component.value).toEqual([])
	})

	it('should follow an item opened by whoever else holds it', async () => {
		item('taxes').open = true
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete

		expect(fixture.component.controller.visible.map(node => node.data.value))
			.toEqual(['documents', 'taxes', '2025.pdf', 'letters', 'readme'])
		expect(item('taxes').getAttribute('aria-expanded')).toBe('true')
	})

	it('should take the children of a closed item out of the tree while leaving them in the markup', async () => {
		click(item('documents'), 'indicator')
		await fixture.updateComplete

		expect(items().length).toBe(5)
		expect(fixture.component.controller.visible.length).toBe(2)
		expect(getComputedStyle(item('taxes')).visibility).toBe('hidden')
		expect(item('taxes').hasAttribute('tabindex')).toBe(false)
	})

	it('should slide and fade the group the children sit in, rather than the rows themselves', () => {
		const group = getComputedStyle(item('documents').renderRoot.querySelector('[part=group]')!)

		expect(group.transitionProperty).toContain('grid-template-rows')
		expect(group.transitionProperty).toContain('opacity')
		expect(group.transitionProperty).toContain('visibility')
		expect(item('taxes').style.getPropertyValue('--mo-tree-level')).toBe('1')
	})

	it('should click the item on Enter, which is its default action', async () => {
		const click = spyOn(item('readme'), 'click').and.callThrough()
		fixture.component.controller.navigability.goTo(item('readme'))

		fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
		await fixture.updateComplete

		expect(click).toHaveBeenCalledTimes(1)
		expect(fixture.component.value).toBe('readme')
	})

	it('should match a typeahead against the own text of a row, without its nested rows', () => {
		fixture.component.controller.navigability.goTo(item('documents'))

		fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true, cancelable: true }))

		expect(fixture.component.controller.navigability.current).toBe(item('readme'))
	})

	it('should move focus onto an item when focused as a whole', async () => {
		await fixture.updateComplete

		fixture.component.focus()

		expect(document.activeElement).toBe(item('documents'))
	})

	it('should reveal a nested item by its value, opening its ancestors', async () => {
		item('documents').open = false
		await fixture.updateComplete

		await fixture.component.reveal('2025.pdf')
		await fixture.updateComplete

		expect(items().filter(item => item.open).map(item => item.value)).toEqual(['documents', 'taxes'])
		expect(fixture.component.controller.navigability.current).toBe(item('2025.pdf'))
	})

	it('should follow items added to the markup afterwards', async () => {
		const added = new TreeItem()
		added.value = 'notes'
		added.textContent = 'Notes.md'
		item('documents').append(added)
		await new Promise(resolve => setTimeout(resolve))
		await fixture.updateComplete

		expect(added.slot).toBe('children')
		expect(fixture.component.controller.visible.map(node => node.data.value)).toEqual(['documents', 'taxes', 'letters', 'notes', 'readme'])
	})
})