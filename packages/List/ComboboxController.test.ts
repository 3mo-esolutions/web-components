import { Component, component, html, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { ComboboxController } from './ComboboxController.js'
import { userEvent } from 'vitest/browser'

const cities = ['Amsterdam', 'Berlin', 'Cairo']

@component('combobox-test')
class ComboboxTest extends Component {
	@state() open = false
	@state() selection: ReadonlyArray<string> = []
	@state() readonly = false
	autocomplete = false
	activateFirst = false
	@state() filter = ''

	readonly combobox = new ComboboxController<string, ComboboxTest>(this, host => ({
		get expanded() { return host.open },
		handleExpandedChange: open => host.open = open,
		get autocomplete() { return host.autocomplete },
		get activateFirst() { return host.activateFirst },
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	get input() { return this.renderRoot.querySelector('input')! }
	get listbox() { return this.renderRoot.querySelector<HTMLElement>('[role=listbox]')! }
	get options() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[role=option]')] }

	protected override get template() {
		return html`
			<input ?readonly=${this.readonly} ${this.combobox.input.ref()}>
			<div ?hidden=${!this.open} ${this.combobox.listbox.ref()}>
				${cities.filter(city => city.toLowerCase().includes(this.filter)).map((city, index) => html`<div ${this.combobox.option({ index, data: city })}>${city}${city !== 'Cairo' ? html.nothing : html`<input type='checkbox'>`}</div>`)}
			</div>
		`
	}
}

ComboboxTest

/** Filters its options by the chosen one, as a list filtered by its input's text does once a choice is written into it. */
@component('combobox-refiltering-test')
class ComboboxRefilteringTest extends Component {
	@state() open = true
	@state() selection: ReadonlyArray<string> = []

	readonly combobox = new ComboboxController<string, ComboboxRefilteringTest>(this, host => ({
		get expanded() { return host.open },
		handleExpandedChange: open => host.open = open,
		get selection() { return host.selection },
		handleChange: selection => host.selection = selection,
	}))

	get options() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[role=option]')] }

	protected override get template() {
		const shown = cities.filter(city => !this.selection.length || this.selection.includes(city))
		return html`
			<input ${this.combobox.input.ref()}>
			<div ?hidden=${!this.open} ${this.combobox.listbox.ref()}>
				${shown.map((city, index) => html`<div ${this.combobox.option({ index, data: city })}>${city}</div>`)}
			</div>
		`
	}
}

ComboboxRefilteringTest

describe('ComboboxController', () => {
	const fixture = new ComponentTestFixture<ComboboxTest>(html`<combobox-test></combobox-test>`)

	const press = (key: string) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true })
		fixture.component.input.dispatchEvent(event)
		return event
	}

	const configure = async (configuration: Partial<Pick<ComboboxTest, 'open' | 'readonly' | 'autocomplete' | 'activateFirst' | 'filter' | 'selection'>>) => {
		Object.assign(fixture.component, configuration)
		fixture.component.requestUpdate()
		await fixture.updateComplete
	}

	it('should make the input a combobox that controls its listbox', () => {
		expect(fixture.component.input.getAttribute('role')).toBe('combobox')
		expect(fixture.component.input.ariaControlsElements).toEqual([fixture.component.listbox])
		expect(fixture.component.options.length).toBe(3)
	})

	it('should say whether the listbox is expanded', async () => {
		expect(fixture.component.input.getAttribute('aria-expanded')).toBe('false')

		await configure({ open: true })

		expect(fixture.component.input.getAttribute('aria-expanded')).toBe('true')
	})

	it('should say it filters as the user types only when it does', async () => {
		expect(fixture.component.input.hasAttribute('aria-autocomplete')).toBe(false)

		await configure({ autocomplete: true })

		expect(fixture.component.input.getAttribute('aria-autocomplete')).toBe('list')
	})

	for (const key of ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp']) {
		it(`should ask to open on ${key}`, () => {
			expect(press(key).defaultPrevented).toBe(true)
			expect(fixture.component.open).toBe(true)
		})
	}

	it('should leave Home and End to an input that takes typing, and open on them otherwise', async () => {
		expect(press('Home').defaultPrevented).toBe(false)
		expect(fixture.component.open).toBe(false)

		await configure({ readonly: true })

		expect(press('End').defaultPrevented).toBe(true)
		expect(fixture.component.open).toBe(true)
	})

	it('should ask to close on Escape, and claim it so nothing around closes as well', async () => {
		await configure({ open: true })

		expect(press('Escape').defaultPrevented).toBe(true)
		expect(fixture.component.open).toBe(false)
	})

	it('should run the arrows on from the last option to the first and back', async () => {
		await configure({ open: true })

		press('ArrowUp')
		expect(fixture.component.input.ariaActiveDescendantElement).toBe(fixture.component.options[2]!)

		press('ArrowDown')
		expect(fixture.component.input.ariaActiveDescendantElement).toBe(fixture.component.options[0]!)
	})

	it('should mark the option a key reached as keyboard focus, which it never really takes, until it collapses', async () => {
		await configure({ open: true })

		press('ArrowDown')
		press('ArrowDown')
		expect(fixture.component.options.filter(option => option.hasAttribute('data-keyboard-focus'))).toEqual([fixture.component.options[1]!])

		await configure({ open: false })
		expect(fixture.component.options.some(option => option.hasAttribute('data-keyboard-focus'))).toBe(false)
	})

	it('should leave no option active once it collapses', async () => {
		await configure({ open: true })
		press('ArrowDown')
		expect(fixture.component.input.ariaActiveDescendantElement).toBe(fixture.component.options[0]!)

		await configure({ open: false })

		expect(fixture.component.input.ariaActiveDescendantElement).toBeNull()
	})

	it('should choose the active option on Enter, and ask to close', async () => {
		await configure({ open: true })
		press('ArrowDown')
		press('ArrowDown')

		press('Enter')

		expect(fixture.component.selection).toEqual(['Berlin'])
		expect(fixture.component.open).toBe(false)
	})

	const active = () => fixture.component.input.ariaActiveDescendantElement

	const open = async (key: string) => {
		press(key)
		await fixture.updateComplete
	}

	it('should land on the first option when opened with ArrowDown or Page Down, and on the last with ArrowUp or Page Up', async () => {
		await open('ArrowDown')
		expect(active()).toBe(fixture.component.options[0]!)

		await configure({ open: false })
		await open('ArrowUp')
		expect(active()).toBe(fixture.component.options[2]!)
	})

	it('should land on the selected option instead, however it was opened', async () => {
		await configure({ selection: ['Berlin'] })

		await open('ArrowUp')

		expect(active()).toBe(fixture.component.options[1]!)
	})

	it('should land on no option when opened otherwise and nothing is selected', async () => {
		await configure({ open: true })

		expect(active()).toBeNull()
	})

	it('should land on the first and last option on Home and End where the input takes no typing, even with a selection', async () => {
		await configure({ readonly: true, selection: ['Berlin'] })

		await open('Home')
		expect(active()).toBe(fixture.component.options[0]!)

		await configure({ open: false })
		await open('End')
		expect(active()).toBe(fixture.component.options[2]!)
	})

	it('should open on Enter and Space only where the input takes no typing', async () => {
		expect(press('Enter').defaultPrevented).toBe(false)
		expect(press(' ').defaultPrevented).toBe(false)
		expect(fixture.component.open).toBe(false)

		await configure({ readonly: true })

		expect(press('Enter').defaultPrevented).toBe(true)
		expect(fixture.component.open).toBe(true)

		await configure({ open: false })

		expect(press(' ').defaultPrevented).toBe(true)
		expect(fixture.component.open).toBe(true)
	})

	it('should land only once the listbox is laid out, as a popover shows it after the host updated', async () => {
		await configure({ selection: ['Berlin'] })
		fixture.component.listbox.style.display = 'none'

		await configure({ open: true })
		expect(active()).toBeNull()

		fixture.component.listbox.style.display = ''
		const start = performance.now()
		while (!active() && performance.now() - start < 1000) {
			await new Promise(resolve => requestAnimationFrame(resolve))
		}

		expect(active()).toBe(fixture.component.options[1]!)
	})

	it('should ask to close on Tab, leaving the key to move focus on', async () => {
		await configure({ open: true })

		expect(press('Tab').defaultPrevented).toBe(false)
		expect(fixture.component.open).toBe(false)
	})

	it('should ask to close once an option is chosen by a click', async () => {
		await configure({ open: true })

		fixture.component.options[0]!.click()

		expect(fixture.component.selection).toEqual(['Amsterdam'])
		expect(fixture.component.open).toBe(false)
	})

	it('should stay open for a click through a control nested in the option, such as a checkbox for choosing several', async () => {
		await configure({ open: true })

		fixture.component.options[2]!.querySelector('input')!.click()

		expect(fixture.component.open).toBe(true)
	})

	describe('when a choice re-renders the options', () => {
		const refiltering = new ComponentTestFixture<ComboboxRefilteringTest>(html`<combobox-refiltering-test></combobox-refiltering-test>`)

		it('should close even though the re-render removed the clicked option before the click was done', async () => {
			const clicked = refiltering.component.options[1]!

			await userEvent.click(clicked)
			await refiltering.updateComplete

			expect(clicked.isConnected).toBe(false)
			expect(refiltering.component.selection).toEqual(['Berlin'])
			expect(refiltering.component.open).toBe(false)
		})
	})

	describe('with activateFirst', () => {
		const activeName = () => fixture.component.input.ariaActiveDescendantElement?.textContent?.trim()

		it('should land on the first option as it opens with nothing selected', async () => {
			await configure({ activateFirst: true, open: true })

			expect(activeName()).toBe('Amsterdam')
		})

		it('should still land on the selected option instead', async () => {
			await configure({ activateFirst: true, selection: ['Berlin'], open: true })

			expect(activeName()).toBe('Berlin')
		})

		it('should make the first option active whenever the options change, and leave the cursor alone otherwise', async () => {
			await configure({ activateFirst: true, open: true })
			press('ArrowDown')
			await configure({})
			expect(activeName()).toBe('Berlin')

			await configure({ filter: 'a' })
			expect(activeName()).toBe('Amsterdam')

			press('ArrowDown')
			await configure({ filter: 'a' })
			expect(activeName()).toBe('Cairo')
		})

		it('should leave the options to the cursor without it', async () => {
			await configure({ open: true })
			expect(activeName()).toBeUndefined()

			await configure({ filter: 'a' })
			expect(activeName()).toBeUndefined()
		})
	})
})