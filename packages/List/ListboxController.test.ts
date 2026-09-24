import { Component, component, ElementRef, html, repeat, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Selectability } from '@3mo/selectability'
import { ListboxController, type ListboxOrientation } from './ListboxController.js'

type Fruit = { readonly id: number, readonly name: string, readonly disabled?: boolean }

const fruits = ['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry'].map((name, index): Fruit => ({ id: index + 1, name }))

@component('listbox-test')
class ListboxTest extends Component {
	@state() items: ReadonlyArray<Fruit> = fruits
	@state() selection: ReadonlyArray<Fruit> = []

	selectability = Selectability.Single
	selectionFollowsFocus = false
	isSelectable?: (fruit: Fruit) => boolean
	orientation: ListboxOrientation = 'vertical'

	readonly controller = new ListboxController<Fruit, ListboxTest>(this, host => ({
		key: fruit => fruit.id,
		get selectability() { return host.selectability },
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
		get selectionFollowsFocus() { return host.selectionFollowsFocus },
		isSelectable: fruit => host.isSelectable?.(fruit) ?? true,
		get orientation() { return host.orientation },
	}))

	get listbox() { return this.renderRoot.querySelector('ul')! }
	get options() { return [...this.renderRoot.querySelectorAll('li')] }
	get outside() { return this.renderRoot.querySelector('button')! }
	get selected() { return [...this.selection].sort((a, b) => a.id - b.id).map(fruit => fruit.name) }
	get active() { return this.options.find(option => option.dataset.navigability === 'current')?.textContent }

	protected override get template() {
		return html`
			<button>Outside</button>
			<ul ${this.controller.listbox.ref()}>
				${repeat(this.items, fruit => fruit.id, (fruit, index) => html`
					<li ${this.controller.option({ index, data: fruit, disabled: fruit.disabled })}>${fruit.name}</li>
				`)}
			</ul>
		`
	}
}

@component('listbox-host-test')
class ListboxHostTest extends Component {
	readonly controller = new ListboxController<string>(this, {})

	protected override get template() {
		return html`${['One', 'Two'].map((name, index) => html`<div ${this.controller.option({ index, data: name })}>${name}</div>`)}`
	}
}

/** A combobox's input in its own shadow root, over options the consumer writes in light DOM. */
@component('listbox-combobox-test')
class ListboxComboboxTest extends Component {
	readonly input = new ElementRef<HTMLInputElement>()
	readonly selections = new Array<ReadonlyArray<string>>()

	readonly controller = new ListboxController<string, ListboxComboboxTest>(this, host => ({
		get combobox() { return host.input.value },
		handleChange: selection => host.selections.push(selection),
	}))

	get options() { return [...this.children] as Array<HTMLElement> }

	protected override firstUpdated() {
		this.options.forEach((option, index) => this.controller.indexability.register(option, { index, data: option.textContent! }))
		this.requestUpdate()
	}

	protected override get template() {
		return html`
			<input role='combobox' ${this.input.ref()}>
			<div ${this.controller.listbox.ref()}>
				<slot></slot>
			</div>
		`
	}
}

ListboxTest
ListboxHostTest
ListboxComboboxTest

const keyDown = (target: EventTarget, key: string, init?: KeyboardEventInit) => {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...init })
	target.dispatchEvent(event)
	return event
}

const click = (target: EventTarget, init?: MouseEventInit) => {
	const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, ...init })
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

describe('ListboxController', () => {
	const fixture = new ComponentTestFixture<ListboxTest>(html`<listbox-test></listbox-test>`)

	const press = (key: string, init?: KeyboardEventInit) => keyDown(fixture.component.listbox, key, init)
	const configure = async (configuration: Partial<Pick<ListboxTest, 'selectability' | 'selectionFollowsFocus' | 'orientation' | 'items' | 'selection' | 'isSelectable'>>) => {
		Object.assign(fixture.component, configuration)
		fixture.component.requestUpdate()
		await fixture.updateComplete
	}
	const withDisabled = (name: string) => fruits.map(fruit => fruit.name === name ? { ...fruit, disabled: true } : fruit)

	describe('roles and states', () => {
		it('should make the listbox a listbox and every option an option', () => {
			expect(fixture.component.listbox.getAttribute('role')).toBe('listbox')
			expect(fixture.component.options.map(option => option.getAttribute('role'))).toEqual(Array(5).fill('option'))
		})

		it('should say which options are selected', () => {
			expect(fixture.component.options.map(option => option.getAttribute('aria-selected'))).toEqual(Array(5).fill('false'))

			click(fixture.component.options[2]!)

			expect(fixture.component.options.map(option => option.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false', 'false'])
		})

		it('should say it takes more than one option only once it does', async () => {
			expect(fixture.component.listbox.hasAttribute('aria-multiselectable')).toBe(false)

			await configure({ selectability: Selectability.Multiple })

			expect(fixture.component.listbox.getAttribute('aria-multiselectable')).toBe('true')
		})

		it('should mark a disabled option and never select it', async () => {
			await configure({ items: withDisabled('Banana') })

			click(fixture.component.options[2]!)

			expect(fixture.component.options[2]!.getAttribute('aria-disabled')).toBe('true')
			expect(fixture.component.options[1]!.hasAttribute('aria-disabled')).toBe(false)
			expect(fixture.component.selected).toEqual([])
		})

		it('should say it runs horizontally only when it does, and move on the horizontal arrows then', async () => {
			expect(fixture.component.listbox.hasAttribute('aria-orientation')).toBe(false)

			await configure({ orientation: 'horizontal' })
			press('ArrowRight')
			press('ArrowRight')
			press('ArrowDown')

			expect(fixture.component.listbox.getAttribute('aria-orientation')).toBe('horizontal')
			expect(fixture.component.active).toBe('Apricot')
		})
	})

	describe('without a listbox part', () => {
		const hostFixture = new ComponentTestFixture<ListboxHostTest>(html`<listbox-host-test></listbox-host-test>`)

		it('should make the host the listbox', () => {
			expect(hostFixture.component.getAttribute('role')).toBe('listbox')
			expect([...hostFixture.component.renderRoot.querySelectorAll('div')].map(option => option.getAttribute('role'))).toEqual(['option', 'option'])
		})
	})

	describe('keyboard', () => {
		it('should move between the options with the arrows, Home and End, stepping over disabled ones', async () => {
			await configure({ items: withDisabled('Apricot') })

			press('ArrowDown')
			expect(fixture.component.active).toBe('Apple')
			press('ArrowDown')
			expect(fixture.component.active).toBe('Banana')
			press('End')
			expect(fixture.component.active).toBe('Cherry')
			press('Home')
			expect(fixture.component.active).toBe('Apple')
		})

		it('should find an option by typing the start of its name', () => {
			press('b')
			press('l')

			expect(fixture.component.active).toBe('Blackberry')
		})

		it('should leave keys pressed outside the listbox alone', () => {
			for (const key of ['ArrowDown', ' ', 'Enter', 'b']) {
				expect(keyDown(fixture.component.outside, key).defaultPrevented, key).toBe(false)
			}
			expect(fixture.component.active).toBeUndefined()
		})
	})

	describe('single selection', () => {
		it('should select the active option on Space and on Enter', () => {
			press('ArrowDown')
			expect(press(' ').defaultPrevented).toBe(true)
			expect(fixture.component.selected).toEqual(['Apple'])

			press('ArrowDown')
			press('Enter')
			expect(fixture.component.selected).toEqual(['Apricot'])
		})

		it('should leave the selection alone while arrowing', () => {
			press('ArrowDown')
			press(' ')
			press('ArrowDown')
			press('ArrowDown')

			expect(fixture.component.selected).toEqual(['Apple'])
		})

		it('should select each option the arrows reach when selection follows focus', async () => {
			await configure({ selectionFollowsFocus: true })

			press('ArrowDown')
			press('ArrowDown')

			expect(fixture.component.selected).toEqual(['Apricot'])
		})

		it('should select the option clicked, in place of the previous one', () => {
			click(fixture.component.options[0]!)
			click(fixture.component.options[3]!)

			expect(fixture.component.selected).toEqual(['Blackberry'])
		})
	})

	describe('multiple selection', () => {
		beforeEach(() => configure({ selectability: Selectability.Multiple }))

		it('should toggle the active option on Space and keep the rest', () => {
			press('ArrowDown')
			press(' ')
			press('ArrowDown')
			press(' ')
			expect(fixture.component.selected).toEqual(['Apple', 'Apricot'])

			press(' ')
			expect(fixture.component.selected).toEqual(['Apple'])
		})

		it('should toggle an option on a click without any modifier', () => {
			click(fixture.component.options[1]!)
			click(fixture.component.options[3]!)
			click(fixture.component.options[1]!)

			expect(fixture.component.selected).toEqual(['Blackberry'])
		})

		it('should extend the selection with Shift and the arrows', () => {
			press('ArrowDown')
			press(' ')
			press('ArrowDown', { shiftKey: true })
			press('ArrowDown', { shiftKey: true })

			expect(fixture.component.selected).toEqual(['Apple', 'Apricot', 'Banana'])
		})

		it('should select the run from the most recent selection to the active option on Shift+Space', () => {
			press('ArrowDown')
			press(' ')
			press('End')
			press(' ', { shiftKey: true })

			expect(fixture.component.selected).toEqual(['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry'])
		})

		it('should select every selectable option on Ctrl+A, and none once all of them are', async () => {
			await configure({ items: withDisabled('Cherry') })

			expect(press('a', { ctrlKey: true }).defaultPrevented).toBe(true)
			expect(fixture.component.selected).toEqual(['Apple', 'Apricot', 'Banana', 'Blackberry'])

			press('a', { ctrlKey: true })
			expect(fixture.component.selected).toEqual([])
		})

		it('should select from the active option to either end with Ctrl+Shift+Home and End, and go there', () => {
			press('ArrowDown')
			press('ArrowDown')
			press('ArrowDown')
			press('End', { ctrlKey: true, shiftKey: true })

			expect(fixture.component.selected).toEqual(['Banana', 'Blackberry', 'Cherry'])
			expect(fixture.component.active).toBe('Cherry')

			press('Home', { ctrlKey: true, shiftKey: true })
			expect(fixture.component.selected).toEqual(['Apple', 'Apricot', 'Banana', 'Blackberry', 'Cherry'])
			expect(fixture.component.active).toBe('Apple')
		})
	})

	describe('focus', () => {
		it('should keep one option in the tab order, the first one while there is no cursor', () => {
			expect(fixture.component.options.map(option => option.tabIndex)).toEqual([0, -1, -1, -1, -1])
			expect(fixture.component.listbox.hasAttribute('tabindex')).toBe(false)
		})

		it('should move focus from where Tab lands onto the first selected option', async context => {
			if (!deliversFocusEvents()) {
				context.skip('no focus events in this browser while its window is inactive')
			}
			await configure({ selectability: Selectability.Multiple, selection: [fruits[3]!, fruits[1]!] })

			fixture.component.options[0]!.focus()

			expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.options[1]!)
			expect(fixture.component.active).toBe('Apricot')
		})

		it('should leave focus on the option a pointer pressed', async context => {
			if (!deliversFocusEvents()) {
				context.skip('no focus events in this browser while its window is inactive')
			}
			await configure({ selection: [fruits[3]!] })

			fixture.component.options[0]!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
			fixture.component.options[0]!.focus()

			expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.options[0]!)
		})
	})

	describe('activation', () => {
		it('should activate an option on Enter by clicking it, so its own click handlers run', () => {
			const handler = vi.fn()
			fixture.component.options[1]!.addEventListener('click', handler)

			press('ArrowDown')
			press('ArrowDown')
			press('Enter')

			expect(handler).toHaveBeenCalledOnce()
			expect(fixture.component.selected).toEqual(['Apricot'])
		})

		it('should select before the option\'s own click handlers run, so theirs have the last word', () => {
			fixture.component.options[2]!.addEventListener('click', () => fixture.component.selection = [])

			click(fixture.component.options[2]!)

			expect(fixture.component.selected).toEqual([])
		})

		it('should navigate to and click an option that is not selectable, without selecting it', async () => {
			await configure({ isSelectable: fruit => fruit.name !== 'Apple' })
			const handler = vi.fn()
			fixture.component.options[0]!.addEventListener('click', handler)

			press('ArrowDown')
			press('Enter')

			expect(fixture.component.active).toBe('Apple')
			expect(handler).toHaveBeenCalledOnce()
			expect(fixture.component.selected).toEqual([])
		})

		it('should make an option the active one on request, and none on request', () => {
			fixture.component.controller.goTo(fruits[3])
			expect(fixture.component.active).toBe('Blackberry')

			fixture.component.controller.goTo(undefined)
			expect(fixture.component.active).toBeUndefined()
		})
	})

	describe('in a combobox', () => {
		const comboboxFixture = new ComponentTestFixture<ListboxComboboxTest>(html`
			<listbox-combobox-test>
				<div>Amsterdam</div>
				<div>Berlin</div>
				<div>Cairo</div>
			</listbox-combobox-test>
		`)

		const input = () => comboboxFixture.component.input.value!
		const options = () => comboboxFixture.component.options

		it('should announce the active option on the input, which an id could not reach across the shadow root', () => {
			keyDown(input(), 'ArrowDown')
			keyDown(input(), 'ArrowDown')

			expect(input().ariaActiveDescendantElement).toBe(options()[1]!)
			expect(options().map(option => option.getAttribute('role'))).toEqual(['option', 'option', 'option'])
		})

		it('should give the options no tab stop of their own', () => {
			expect(options().some(option => option.hasAttribute('tabindex'))).toBe(false)
		})

		it('should leave the input its caret keys, its typing and Space', () => {
			keyDown(input(), 'ArrowDown')

			for (const key of ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'b', ' ']) {
				expect(keyDown(input(), key).defaultPrevented, key).toBe(false)
			}
			expect(input().ariaActiveDescendantElement).toBe(options()[0]!)
		})

		it('should select the active option on Enter, and leave Enter alone while there is none', () => {
			expect(keyDown(input(), 'Enter').defaultPrevented).toBe(false)

			keyDown(input(), 'ArrowDown')
			keyDown(input(), 'ArrowDown')
			expect(keyDown(input(), 'Enter').defaultPrevented).toBe(true)

			expect(comboboxFixture.component.selections).toEqual([['Berlin']])
		})

		it('should keep focus in the input when an option is pressed, and select it', () => {
			const press = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true })
			options()[2]!.dispatchEvent(press)
			click(options()[2]!)

			expect(press.defaultPrevented).toBe(true)
			expect(comboboxFixture.component.selections).toEqual([['Cairo']])
		})
	})
})