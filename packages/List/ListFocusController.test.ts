import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type CollapsibleListItem, type List, type SelectableList } from './index.js'

const keyDown = (key: string, options?: KeyboardEventInit) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options })
	document.dispatchEvent(event)
	return event
}

describe('ListFocusController', () => {
	describe('default focused item', () => {
		const fixture = new ComponentTestFixture<SelectableList>(html`
			<mo-selectable-list>
				<mo-selectable-list-item>Item 1</mo-selectable-list-item>
				<mo-selectable-list-item>Item 2</mo-selectable-list-item>
				<mo-selectable-list-item>Item 3</mo-selectable-list-item>
				<mo-selectable-list-item>Item 4</mo-selectable-list-item>
			</mo-selectable-list>
		`)

		const focus = () => fixture.component.focusController

		const select = async (...indices: Array<number>) => {
			fixture.component.value = indices
			await fixture.updateComplete
		}

		it('should focus the selected item when the list is focused without one', async () => {
			await select(2)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(2)
			expect(fixture.component.items[2]!.hasAttribute('focused')).toBe(true)
		})

		it('should focus the topmost selected item of a multiple selection', async () => {
			await select(3, 1)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(1)
		})

		it('should leave the list without a focused item when nothing is selected', () => {
			focus().focusIn()

			expect(focus().focusedItemIndex).toBeUndefined()
			expect(fixture.component.items.some(item => item.hasAttribute('focused'))).toBe(false)
		})

		it('should not overrule an item that is already focused', async () => {
			await select(2)
			focus().focusItem(fixture.component.items[0]!)

			focus().focusIn()

			expect(focus().focusedItemIndex).toBe(0)
		})

		it('should start keyboard traversal from the selected item', async () => {
			await select(1)
			focus().focusIn()

			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))

			expect(focus().focusedItemIndex).toBe(2)
		})

		it('should scroll the selected item into view', async () => {
			fixture.component.style.display = 'block'
			fixture.component.style.maxHeight = '50px'
			fixture.component.style.overflowY = 'auto'
			await select(3)

			focus().focusIn()

			expect(fixture.component.scrollTop).toBeGreaterThan(0)
		})
	})

	describe('focusedItemIndex', () => {
		const fixture = new ComponentTestFixture<SelectableList>(html`<mo-selectable-list></mo-selectable-list>`)

		it('should stay undefined while the list has no items', () => {
			fixture.component.focusController.focusedItemIndex = 0

			expect(fixture.component.focusController.focusedItemIndex).toBeUndefined()
		})
	})

	describe('keyboard traversal', () => {
		const fixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-list-item>Item 2</mo-list-item>
				<mo-list-item>Item 3</mo-list-item>
				<mo-list-item>Item 4</mo-list-item>
			</mo-list>
		`)

		const collapsibleFixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-collapsible-list-item>
					<mo-list-item>Item 2</mo-list-item>
					<mo-list-item slot='details'>Item 2.1</mo-list-item>
				</mo-collapsible-list-item>
				<mo-list-item>Item 3</mo-list-item>
			</mo-list>
		`)

		const focus = () => fixture.component.focusController

		it('should move the focus to the next and previous item on ArrowDown and ArrowUp', () => {
			focus().focusIn()

			keyDown('ArrowDown')
			keyDown('ArrowDown')
			expect(focus().focusedItemIndex).toBe(1)

			keyDown('ArrowUp')
			expect(focus().focusedItemIndex).toBe(0)
		})

		it('should wrap from either end of the list to the other', () => {
			focus().focusIn()

			keyDown('End')
			keyDown('ArrowDown')
			expect(focus().focusedItemIndex).toBe(0)

			keyDown('ArrowUp')
			expect(focus().focusedItemIndex).toBe(fixture.component.items.length - 1)
		})

		for (const [first, last] of [['Home', 'End'], ['PageUp', 'PageDown']] as const) {
			it(`should jump to the first and last item on ${first} and ${last}`, () => {
				focus().focusIn()

				keyDown(last)
				expect(focus().focusedItemIndex).toBe(fixture.component.items.length - 1)

				keyDown(first)
				expect(focus().focusedItemIndex).toBe(0)
			})
		}

		it('should skip disabled items', () => {
			fixture.component.items[1]!.toggleAttribute('disabled', true)
			focus().focusIn()

			keyDown('ArrowDown')
			keyDown('ArrowDown')

			expect(focus().focusedItemIndex).toBe(2)
		})

		it('should skip aria-hidden items, so a closed collapsible\'s children are stepped over', async () => {
			const collapsible = collapsibleFixture.component.querySelector<CollapsibleListItem>('mo-collapsible-list-item')!
			collapsible.open = true
			await collapsible.updateComplete
			collapsible.open = false
			await collapsible.updateComplete
			expect(collapsibleFixture.component.items[2]!.getAttribute('aria-hidden')).toBe('true')

			collapsibleFixture.component.focusController.focusIn()
			keyDown('ArrowDown')
			keyDown('ArrowDown')
			keyDown('ArrowDown')

			expect(collapsibleFixture.component.focusController.focusedItemIndex).toBe(3)
		})

		it('should prevent the handled keys from scrolling the page', () => {
			focus().focusIn()

			for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown']) {
				expect(keyDown(key).defaultPrevented).toBe(true)
			}

			expect(keyDown('a').defaultPrevented).toBe(false)
		})

		for (const [modifier, key] of [['ctrl', 'ctrlKey'], ['shift', 'shiftKey']] as const) {
			it(`should ignore keys while ${modifier} is held, leaving them to selection`, () => {
				focus().focusIn()
				keyDown('ArrowDown')

				const event = keyDown('ArrowDown', { [key]: true })

				expect(focus().focusedItemIndex).toBe(0)
				expect(event.defaultPrevented).toBe(false)
			})
		}

		it('should ignore keys while the list is not focused', () => {
			const event = keyDown('ArrowDown')

			expect(focus().focusedItemIndex).toBeUndefined()
			expect(event.defaultPrevented).toBe(false)
		})

		it('should re-dispatch every keydown to the items as a listKeyDown event carrying the original event', () => {
			focus().focusIn()
			const events = new Array<CustomEvent<KeyboardEvent>>()
			fixture.component.items[0]!.addEventListener('listKeyDown', event => events.push(event as CustomEvent<KeyboardEvent>))

			const event = keyDown('a')

			expect(events.length).toBe(1)
			expect(events[0]!.detail).toBe(event)
		})
	})

	describe('focus stamping', () => {
		const fixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-list-item>Item 2</mo-list-item>
				<mo-list-item>Item 3</mo-list-item>
			</mo-list>
		`)

		const focus = () => fixture.component.focusController

		const stamped = (attribute: string) => fixture.component.items.filter(item => item.hasAttribute(attribute))

		it('should mark exactly the focused item with the focused attribute', () => {
			focus().focusIn()

			keyDown('ArrowDown')
			keyDown('ArrowDown')

			expect(stamped('focused').length).toBe(1)
			expect(fixture.component.items.findIndex(item => item.hasAttribute('focused'))).toBe(1)
		})

		it('should mark items with data-keyboard-focus only while focus came from the keyboard', () => {
			focus().focusIn()
			expect(stamped('data-keyboard-focus').length).toBe(0)

			keyDown('ArrowDown')

			expect(stamped('data-keyboard-focus').length).toBe(fixture.component.items.length)
		})
	})

	describe('tab order', () => {
		const fixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-list-item>Item 2</mo-list-item>
			</mo-list>
		`)

		it('should make itself the single tab stop and take the items out of the tab order', async () => {
			const parent = fixture.component.parentElement!
			fixture.component.remove()
			parent.appendChild(fixture.component)
			await fixture.updateComplete

			expect(fixture.component.tabIndex).toBe(0)
			expect(fixture.component.items.map(item => item.tabIndex)).toEqual([-1, -1])
		})

		it('should leave the tab order when disconnected', () => {
			fixture.component.remove()

			expect(fixture.component.tabIndex).toBe(-1)
		})
	})

	describe('nested focused lists', () => {
		const fixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-list-item>Item 2</mo-list-item>
				<mo-list id='inner'>
					<mo-list-item>Item 3</mo-list-item>
					<mo-list-item>Item 4</mo-list-item>
				</mo-list>
			</mo-list>
		`)

		const outer = () => fixture.component.focusController
		const inner = () => fixture.component.querySelector<List>('#inner')!.focusController

		it('should hand the keys to the most recently focused list only, so a submenu\'s keys never move its parent', () => {
			outer().focusIn()
			keyDown('ArrowDown')

			inner().focusIn()
			keyDown('ArrowDown')

			expect(inner().focusedItemIndex).toBe(0)
			expect(outer().focusedItemIndex).toBe(0)

			inner().focusOut()
			outer().focusOut()
		})

		it('should return the keys to the outer list once the inner one focuses out', () => {
			outer().focusIn()
			keyDown('ArrowDown')
			inner().focusIn()
			keyDown('ArrowDown')

			inner().focusOut()
			keyDown('ArrowDown')

			expect(outer().focusedItemIndex).toBe(1)

			outer().focusOut()
		})
	})

	describe('pointer', () => {
		const fixture = new ComponentTestFixture<List>(html`
			<mo-list>
				<mo-list-item>Item 1</mo-list-item>
				<mo-list-item>Item 2</mo-list-item>
				<mo-list-item>Item 3</mo-list-item>
			</mo-list>
		`)

		it('should focus the item a pointer pressed on, resolved through the composed path', () => {
			const ripple = fixture.component.items[2]!.shadowRoot!.querySelector('mo-list-item-ripple')!
			ripple.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))

			expect(fixture.component.focusController.focusedItemIndex).toBe(2)
		})
	})
})