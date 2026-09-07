import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Selectability } from '@3mo/selectability'
import { TreeController } from './TreeController.js'

type Folder = { readonly name: string, readonly folders?: Array<Folder>, readonly disabled?: boolean }

const folders = (): Array<Folder> => [
	{ name: 'Documents', folders: [{ name: 'Taxes', folders: [{ name: '2025' }, { name: '2026' }] }, { name: 'Letters' }] },
	{ name: 'Pictures', folders: [{ name: 'Holidays' }] },
	{ name: 'Music' },
]

/** A bare tree of divs, built once: the controller is the whole behaviour; the host only hides what is closed. */
@component('tree-controller-test')
class TreeControllerTest extends Component {
	override readonly role = 'tree'

	roots = TreeControllerTest.build(folders())

	selectability?: Selectability = Selectability.Multiple
	expandOnClick = true

	readonly controller = new TreeController<HTMLElement, TreeControllerTest>(this, host => ({
		get items() { return host.roots },
		children: item => [...item.querySelectorAll<HTMLElement>(':scope > .children > .item')],
		isDisabled: item => item.hasAttribute('data-disabled'),
		get selectability() { return host.selectability },
		get expandOnClick() { return host.expandOnClick },
	}))

	static build(folders: Array<Folder>): Array<HTMLElement> {
		return folders.map(folder => {
			const item = document.createElement('div')
			item.className = 'item'
			item.dataset.name = folder.name
			item.toggleAttribute('data-disabled', !!folder.disabled)
			item.innerHTML = `<div class='row'><span part='indicator'></span><span>${folder.name}</span></div>`
			if (folder.folders) {
				const children = document.createElement('div')
				children.className = 'children'
				children.append(...TreeControllerTest.build(folder.folders))
				item.append(children)
			}
			return item
		})
	}

	set data(folders: Array<Folder>) {
		this.roots = TreeControllerTest.build(folders)
		this.controller.invalidate()
		this.requestUpdate()
	}

	get items() { return this.controller.visible.map(node => node.data) }
	item(name: string) { return this.controller.nodes.find(node => node.data.dataset.name === name)!.data }
	get visibleNames() { return this.controller.visible.map(node => node.data.dataset.name) }

	protected override get template() {
		return html`${this.roots}`
	}

	protected override updated() {
		for (const node of this.controller.nodes) {
			node.data.querySelector<HTMLElement>(':scope > .children')?.toggleAttribute('hidden', !this.controller.expandability.isExpanded(node.data))
		}
	}
}

const keyDown = (target: EventTarget, key: string, init?: KeyboardEventInit) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...init })
	target.dispatchEvent(event)
	return event
}

const click = (target: Element, type = 'click') => target.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true }))

describe('TreeController', () => {
	const fixture = new ComponentTestFixture<TreeControllerTest>(html`<tree-controller-test></tree-controller-test>`)

	const tree = () => fixture.component.controller
	const item = (name: string) => fixture.component.item(name)
	const selected = () => tree().selectability.selection.map(item => item.dataset.name)
	const settle = () => fixture.updateComplete

	describe('visible sequence', () => {
		it('should show the roots only until something expands', () => {
			expect(fixture.component.visibleNames).toEqual(['Documents', 'Pictures', 'Music'])
		})

		it('should show the children of expanded nodes in pre-order', async () => {
			await tree().expandability.expand(item('Documents'))
			await tree().expandability.expand(item('Taxes'))
			await settle()

			expect(fixture.component.visibleNames).toEqual(['Documents', 'Taxes', '2025', '2026', 'Letters', 'Pictures', 'Music'])
		})
	})

	describe('stamps', () => {
		it('should give every item its role, level, set size and position', async () => {
			await tree().expandability.expand(item('Documents'))
			await settle()
			const taxes = item('Taxes')

			expect(taxes.getAttribute('role')).toBe('treeitem')
			expect(taxes.getAttribute('aria-level')).toBe('2')
			expect(taxes.getAttribute('aria-setsize')).toBe('2')
			expect(taxes.getAttribute('aria-posinset')).toBe('1')
			expect(taxes.style.getPropertyValue('--mo-tree-level')).toBe('1')
			expect(item('Music').getAttribute('aria-level')).toBe('1')
		})

		it('should stamp aria-expanded on parents only', async () => {
			await settle()
			expect(item('Documents').getAttribute('aria-expanded')).toBe('false')
			expect(item('Music').hasAttribute('aria-expanded')).toBe(false)

			await tree().expandability.expand(item('Documents'))
			await settle()

			expect(item('Documents').getAttribute('aria-expanded')).toBe('true')
			expect(item('Documents').getAttribute('aria-expanded')).toBe('true')
		})

		it('should keep the current item as the only tab stop, and take a hidden item out of the tab order', async () => {
			await settle()
			expect(fixture.component.items.map(item => item.tabIndex)).toEqual([0, -1, -1])

			tree().navigability.goTo(item('Pictures'))
			await settle()
			expect(fixture.component.items.map(item => item.tabIndex)).toEqual([-1, 0, -1])

			await tree().expandability.expand(item('Documents'))
			await settle()
			tree().expandability.collapse(item('Documents'))
			await settle()

			expect(item('Taxes').hasAttribute('tabindex')).toBe(false)
		})

		it('should mark disabled items', async () => {
			fixture.component.data = [{ name: 'Locked', disabled: true }, { name: 'Open' }]
			await settle()

			expect(item('Locked').getAttribute('aria-disabled')).toBe('true')
			expect(item('Open').hasAttribute('aria-disabled')).toBe(false)
			expect(fixture.component.items.map(item => item.tabIndex)).toEqual([-1, 0])
		})

		it('should announce the selection as selected, or as checked when told so', async () => {
			await settle()
			tree().selectability.select(item('Music'))
			await settle()

			expect(item('Music').getAttribute('aria-selected')).toBe('true')
			expect(item('Documents').getAttribute('aria-selected')).toBe('false')
			expect(fixture.component.hasAttribute('aria-multiselectable')).toBe(true)

			fixture.component.selectability = undefined
			fixture.component.requestUpdate()
			await settle()

			expect(item('Music').hasAttribute('aria-selected')).toBe(false)
			expect(item('Music').hasAttribute('aria-selected')).toBe(false)
		})
	})

	describe('pointer', () => {
		it('should select and toggle a parent when its content is clicked', async () => {
			await settle()

			click(item('Documents').querySelector('.row')!)
			await settle()

			expect(selected()).toEqual(['Documents'])
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)
			expect(tree().navigability.current).toBe(item('Documents'))
		})

		it('should toggle without selecting when the indicator is clicked', async () => {
			await settle()

			click(item('Documents').querySelector('[part=indicator]')!)
			await settle()

			expect(selected()).toEqual([])
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)
		})

		it('should leave expanding to the indicator when told so', async () => {
			fixture.component.expandOnClick = false
			await settle()

			click(item('Documents').querySelector('.row')!)
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(false)

			click(item('Documents').querySelector('[part=indicator]')!)
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)
		})

		it('should ignore disabled items', async () => {
			fixture.component.data = [{ name: 'Locked', disabled: true, folders: [{ name: 'Inside' }] }]
			await settle()

			click(item('Locked').querySelector('.row')!)

			expect(selected()).toEqual([])
			expect(tree().expandability.isExpanded(item('Locked'))).toBe(false)
		})

		it('should follow focus that arrives by other means', async () => {
			await settle()

			item('Music').dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))

			expect(tree().navigability.current).toBe(item('Music'))
		})

	})

	describe('keyboard', () => {
		const press = (key: string, init?: KeyboardEventInit) => keyDown(fixture.component, key, init)
		const currentName = () => tree().navigability.current?.dataset.name

		beforeEach(async () => {
			await settle()
			tree().navigability.goTo(item('Documents'))
		})

		it('should expand on Right, then move into the first child', async () => {
			press('ArrowRight')
			await settle()
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)
			expect(currentName()).toBe('Documents')

			press('ArrowRight')
			expect(currentName()).toBe('Taxes')
		})

		it('should collapse on Left, then move to the parent', async () => {
			await tree().expandability.expand(item('Documents'))
			await settle()
			tree().navigability.goTo(item('Letters'))

			press('ArrowLeft')
			expect(currentName()).toBe('Documents')
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)

			press('ArrowLeft')
			expect(tree().expandability.isExpanded(item('Documents'))).toBe(false)
		})

		it('should move over the visible nodes with Down and Up, Home and End', async () => {
			await tree().expandability.expand(item('Documents'))
			await settle()

			press('ArrowDown')
			expect(currentName()).toBe('Taxes')
			press('End')
			expect(currentName()).toBe('Music')
			press('ArrowUp')
			expect(currentName()).toBe('Pictures')
			press('Home')
			expect(currentName()).toBe('Documents')
		})

		it('should expand every sibling on the asterisk', async () => {
			press('*')
			await settle()

			expect(tree().expandability.isExpanded(item('Documents'))).toBe(true)
			expect(tree().expandability.isExpanded(item('Pictures'))).toBe(true)
		})

		it('should click the item on Enter', () => {
			const clicked = spyOn(item('Documents'), 'click')

			press('Enter')

			expect(clicked).toHaveBeenCalledTimes(1)
		})

		it('should toggle the selection on Space', () => {
			press(' ')
			expect(selected()).toEqual(['Documents'])

			press('ArrowDown')
			press(' ')
			expect(selected()).toEqual(['Documents', 'Pictures'])

			press(' ')
			expect(selected()).toEqual(['Documents'])
		})

		it('should extend the selection with Shift and an arrow', () => {
			press(' ')
			press('ArrowDown', { shiftKey: true })
			press('ArrowDown', { shiftKey: true })

			expect(selected()).toEqual(['Documents', 'Pictures', 'Music'])
		})

		it('should select everything visible on Ctrl+A', async () => {
			await tree().expandability.expand(item('Documents'))
			await settle()

			press('a', { ctrlKey: true })

			expect(selected()).toEqual(['Documents', 'Taxes', 'Letters', 'Pictures', 'Music'])
		})

		it('should find a node by typing', () => {
			press('p')

			expect(currentName()).toBe('Pictures')
		})

		it('should move the cursor to the node that collapsed over it', async () => {
			await tree().expandability.expand(item('Documents'))
			await tree().expandability.expand(item('Taxes'))
			await settle()
			tree().navigability.goTo(item('2026'))

			tree().expandability.collapse(item('Documents'))

			expect(currentName()).toBe('Documents')
		})
	})

	describe('reveal', () => {
		it('should open the ancestors and put the cursor on the node', async () => {
			await tree().reveal(item('2026'))
			await settle()

			expect(fixture.component.visibleNames).toEqual(['Documents', 'Taxes', '2025', '2026', 'Letters', 'Pictures', 'Music'])
			expect(tree().navigability.current).toBe(item('2026'))
		})
	})
})