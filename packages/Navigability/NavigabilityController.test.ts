import { component, Component, html, repeat, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { NavigabilityController, type NavigabilityChange, type NavigabilityFocus } from './NavigabilityController.js'

type Fruit = { readonly id: number, readonly name: string, readonly disabled?: boolean }

const fruits = (...names: Array<string>) => names.map((name, index): Fruit => ({ id: index + 1, name }))

@component('navigability-test')
class NavigabilityTest extends Component {
	@state() items: ReadonlyArray<Fruit> = fruits('Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry')

	navigabilityFocus: NavigabilityFocus = 'roving'
	wrap = false
	typeahead: boolean | ((fruit: Fruit) => string) = true
	stamping = true
	handleKeyDown?: (event: KeyboardEvent, item: Fruit | undefined) => boolean | void

	readonly changes = new Array<NavigabilityChange<Fruit>>()

	readonly controller = new NavigabilityController<Fruit, NavigabilityTest>(this, host => ({
		get items() { return host.items },
		key: fruit => fruit.id,
		isNavigable: fruit => !fruit.disabled,
		get focus() { return host.navigabilityFocus },
		get wrap() { return host.wrap },
		get typeahead() { return host.typeahead },
		get stamping() { return host.stamping },
		handleChange: change => host.changes.push(change),
		handleKeyDown: (event, item) => host.handleKeyDown?.(event, item),
	}))

	get elements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[role=option]')] }

	protected override get template() {
		return html`
			<div role='listbox'>
				${repeat(this.items, fruit => fruit.id, (fruit, index) => html`
					<div role='option' ${this.controller.item({ index, data: fruit, disabled: fruit.disabled })}>${fruit.name}</div>
				`)}
			</div>
		`
	}
}

const keyDown = (target: EventTarget, key: string, init?: KeyboardEventInit) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...init })
	target.dispatchEvent(event)
	return event
}

/** Firefox applies `focus()` but delivers no focus events while its window is inactive, which headless runs are. */
const deliversFocusEvents = () => {
	const probe = document.createElement('button')
	document.body.append(probe)
	let delivered = false
	probe.addEventListener('focusin', () => delivered = true)
	probe.focus()
	probe.remove()
	return delivered
}

describe('NavigabilityController', () => {
	const fixture = new ComponentTestFixture<NavigabilityTest>(html`<navigability-test></navigability-test>`)

	const controller = () => fixture.component.controller
	const names = () => fixture.component.items.map(fruit => fruit.name)

	describe('cursor', () => {
		it('should start without a current item', () => {
			expect(controller().index).toBeUndefined()
			expect(controller().current).toBeUndefined()
		})

		it('should step forward and backward over the items', () => {
			controller().goNext()
			controller().goNext()
			expect(controller().current?.name).toBe('Apricot')

			controller().goPrevious()
			expect(controller().current?.name).toBe('Apple')
		})

		it('should stop at the ends unless asked to wrap', () => {
			controller().goLast()
			expect(controller().goNext()).toBe(false)
			expect(controller().current?.name).toBe('Cherry')

			fixture.component.wrap = true
			expect(controller().goNext()).toBe(true)
			expect(controller().current?.name).toBe('Apple')
		})

		it('should step over items that are not navigable', () => {
			fixture.component.items = [...fixture.component.items.slice(0, 1), { ...fixture.component.items[1]!, disabled: true }, ...fixture.component.items.slice(2)]

			controller().goFirst()
			controller().goNext()

			expect(controller().current?.name).toBe('Banana')
		})

		it('should go to an item by identity or by index', () => {
			controller().goTo(fixture.component.items[3])
			expect(controller().index).toBe(3)

			controller().goTo(1)
			expect(controller().current?.name).toBe('Apricot')

			expect(controller().goTo({ id: 99, name: 'Nothing' })).toBe(false)
			expect(controller().index).toBe(1)
		})

		it('should report every move once, with where it came from', () => {
			controller().goNext()
			controller().goNext()
			controller().goNext()

			expect(fixture.component.changes.map(change => [change.index, change.method])).toEqual([
				[0, 'programmatic'],
				[1, 'programmatic'],
				[2, 'programmatic'],
			])
		})
	})

	describe('reconciliation', () => {
		it('should follow its item by key when the items are reordered', async () => {
			controller().goTo(fixture.component.items[1])
			fixture.component.items = [...fixture.component.items].reverse()
			await fixture.updateComplete

			expect(controller().index).toBe(3)
			expect(controller().current?.name).toBe('Apricot')
		})

		it('should snap to the nearest navigable item when its own disappears', async () => {
			controller().goTo(2)
			fixture.component.items = fixture.component.items.filter(fruit => fruit.name !== 'Banana')
			await fixture.updateComplete

			expect(controller().current?.name).toBe('Blackberry')
		})

		it('should clamp to the last item when the items shrink past it', async () => {
			controller().goLast()
			fixture.component.items = fixture.component.items.slice(0, 2)
			await fixture.updateComplete

			expect(controller().current?.name).toBe('Apricot')
		})

		it('should snap backward when nothing navigable is left ahead of the desired index', async () => {
			controller().goTo(2)
			fixture.component.items = fixture.component.items.map((fruit, index) => index >= 2 ? { ...fruit, disabled: true } : fruit)
			await fixture.updateComplete

			expect(controller().current?.name).toBe('Apricot')
		})

		it('should remember the desired index and return to it once an item is there again', async () => {
			controller().goTo(4)
			fixture.component.items = fixture.component.items.slice(0, 3)
			await fixture.updateComplete
			expect(controller().index).toBe(2)

			fixture.component.items = fruits(...names(), 'Damson', 'Elderberry', 'Fig')
			await fixture.updateComplete

			expect(controller().index).toBe(4)
		})

		it('should drop the cursor entirely on clear', () => {
			controller().goNext()
			controller().clear()

			expect(controller().index).toBeUndefined()
		})
	})

	describe('keyboard', () => {
		const press = (key: string, init?: KeyboardEventInit) => keyDown(fixture.component, key, init)

		it('should move on the arrows of its orientation and prevent their default', () => {
			expect(press('ArrowDown').defaultPrevented).toBe(true)
			expect(press('ArrowDown').defaultPrevented).toBe(true)
			expect(controller().index).toBe(1)

			press('ArrowUp')
			expect(controller().index).toBe(0)

			expect(press('ArrowRight').defaultPrevented).toBe(false)
			expect(controller().index).toBe(0)
		})

		it('should jump with Home and End', () => {
			press('End')
			expect(controller().index).toBe(4)

			press('Home')
			expect(controller().index).toBe(0)
		})

		it('should claim an arrow at the end even though nothing moves, so the page does not scroll', () => {
			controller().goLast()

			expect(press('ArrowDown').defaultPrevented).toBe(true)
		})

		it('should move on Shift+Arrow and hand the event on, and leave Ctrl, Meta and Alt arrows alone', () => {
			controller().goFirst()

			const event = press('ArrowDown', { shiftKey: true })
			expect(event.defaultPrevented).toBe(true)
			expect(controller().index).toBe(1)
			expect(fixture.component.changes.at(-1)?.event).toBe(event)

			expect(press('ArrowDown', { ctrlKey: true }).defaultPrevented).toBe(false)
			expect(press('ArrowDown', { metaKey: true }).defaultPrevented).toBe(false)
			expect(press('ArrowDown', { altKey: true }).defaultPrevented).toBe(false)
			expect(controller().index).toBe(1)
		})

		it('should let the owner claim a key first', () => {
			fixture.component.handleKeyDown = event => event.key === 'ArrowDown'
			controller().goFirst()

			const event = press('ArrowDown')

			expect(event.defaultPrevented).toBe(true)
			expect(controller().index).toBe(0)
		})

		it('should ignore keys while disabled by a prior default prevention', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
			event.preventDefault()
			fixture.component.dispatchEvent(event)

			expect(controller().index).toBeUndefined()
		})
	})

	describe('typeahead', () => {
		const type = (text: string) => [...text].forEach(character => keyDown(fixture.component, character))

		it('should move to the first item whose text starts with what was typed', () => {
			type('b')
			expect(controller().current?.name).toBe('Banana')

			type('l')
			expect(controller().current?.name).toBe('Blackberry')
		})

		it('should cycle through the items starting with a repeated character', () => {
			type('a')
			expect(controller().current?.name).toBe('Apple')
			type('a')
			expect(controller().current?.name).toBe('Apricot')
			type('a')
			expect(controller().current?.name).toBe('Apple')
		})

		it('should forget the prefix after the timeout', async () => {
			type('b')
			await new Promise(resolve => setTimeout(resolve, NavigabilityController.typeaheadTimeout + 50))

			type('c')

			expect(controller().current?.name).toBe('Cherry')
		})

		it('should read the text off the item when given a function', () => {
			fixture.component.typeahead = fruit => fruit.name.split('').reverse().join('')

			type('y')

			expect(controller().current?.name).toBe('Blackberry')
		})

		it('should not steal plain characters when typeahead is off', () => {
			fixture.component.typeahead = false

			expect(keyDown(fixture.component, 'b').defaultPrevented).toBe(false)
			expect(controller().index).toBeUndefined()
		})
	})

	describe('pointer and focus', () => {
		it('should put the cursor on the item a pointer pressed', () => {
			fixture.component.elements[2]!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))

			expect(controller().index).toBe(2)
			expect(fixture.component.changes.at(-1)?.method).toBe('pointer')
		})

		it('should follow DOM focus onto an item in the roving strategy', () => {
			if (!deliversFocusEvents()) {
				pending('no focus events in this browser while its window is inactive')
			}

			fixture.component.elements[3]!.focus()

			expect(controller().index).toBe(3)
		})
	})

	describe('stamping', () => {
		it('should mark exactly the current item', () => {
			controller().goTo(1)

			expect(fixture.component.elements.map(element => element.dataset.navigability)).toEqual([undefined, 'current', undefined, undefined, undefined])
			expect(fixture.component.elements[1]!.dataset.navigabilityMethod).toBe('programmatic')
		})

		it('should keep exactly one item in the tab order while roving', async () => {
			await fixture.updateComplete
			expect(fixture.component.elements.map(element => element.tabIndex)).toEqual([0, -1, -1, -1, -1])

			controller().goTo(2)

			expect(fixture.component.elements.map(element => element.tabIndex)).toEqual([-1, -1, 0, -1, -1])
		})

		it('should move DOM focus along with the cursor while the host holds focus', () => {
			if (!deliversFocusEvents()) {
				pending('no focus events in this browser while its window is inactive')
			}

			fixture.component.elements[0]!.focus()
			controller().goNext()

			expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.elements[1]!)
		})

		it('should announce the current item through aria-activedescendant instead, in that strategy', async () => {
			fixture.component.navigabilityFocus = 'activedescendant'
			fixture.component.requestUpdate()
			await fixture.updateComplete

			controller().goTo(2)

			expect(fixture.component.getAttribute('aria-activedescendant')).toBe(fixture.component.elements[2]!.id)
			expect(fixture.component.elements.every(element => element.tabIndex === -1 || !element.hasAttribute('tabindex'))).toBe(true)
		})

		it('should stamp nothing when told so', async () => {
			fixture.component.stamping = false
			fixture.component.requestUpdate()
			await fixture.updateComplete

			controller().goTo(1)

			expect(fixture.component.elements.some(element => element.dataset.navigability)).toBe(false)
		})
	})
})