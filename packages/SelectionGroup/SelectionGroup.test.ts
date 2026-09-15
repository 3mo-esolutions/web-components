import { Component, component, event, html, ifDefined, property, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type SelectionGroup } from './SelectionGroup.js'
import { SelectionGroupPattern } from './SelectionGroupController.js'
import './index.js'

/**
 * An item whose control lives in a shadow root, which is what `mo-chip` and `mo-selectable-button` are to
 * the group. It is declared here rather than imported because the group is the *lower* package — they
 * depend on it — so its own spec must not depend back on one of them.
 *
 * It is also the contract written out: render the state and the pattern the group hands you, wherever
 * your control happens to be, and ask before you answer.
 */
@component('selection-group-test-item')
class SelectionGroupTestItem extends Component {
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: true }

	@event({ bubbles: true }) readonly change!: EventDispatcher<boolean>

	@property() value?: string
	@property({ type: Boolean, reflect: true }) selectable = false
	@property({ type: Boolean, reflect: true }) selected = false
	@property({ type: Boolean, reflect: true }) disabled = false
	@property() selectionPattern?: SelectionGroupPattern

	@query('button') readonly buttonElement!: HTMLButtonElement

	override focus(options?: FocusOptions) {
		this.buttonElement?.focus(options)
	}

	private get isRadio() { return this.selectionPattern === SelectionGroupPattern.Radio }

	protected override get template() {
		return html`
			<button ?disabled=${this.disabled}
				role=${ifDefined(this.selectable && this.isRadio ? 'radio' : undefined)}
				aria-checked=${ifDefined(this.selectable && this.isRadio ? String(this.selected) : undefined)}
				aria-pressed=${ifDefined(this.selectable && !this.isRadio ? String(this.selected) : undefined)}
				@click=${() => this.handleClick()}
			>
				<slot></slot>
			</button>
		`
	}

	private handleClick() {
		const requested = this.dispatchEvent(new CustomEvent<boolean>('requestSelect', {
			detail: !this.selected,
			bubbles: true,
			cancelable: true,
		}))
		if (!this.selectable || !requested) {
			return
		}
		this.selected = !this.selected
		this.change.dispatch(this.selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'selection-group-test-item': SelectionGroupTestItem
	}
}

/**
 * The contract, asserted against both kinds of item the group promises to take: a plain element that is
 * itself the control, and a component whose control lives in a shadow root — which is why the item cannot
 * be required to BE the control, since a chip's shadow root holds two of them.
 *
 * What differs between them is only where the control is. The group writes the state and the pattern; the
 * item renders them wherever its control happens to live.
 */
const kinds = [
	{
		name: 'plain buttons',
		template: (value: string) => html`<button value=${value}>${value}</button>`,
		control: (item: HTMLElement) => item,
	},
	{
		name: 'items with a control of their own',
		template: (value: string) => html`<selection-group-test-item value=${value}>${value}</selection-group-test-item>`,
		control: (item: HTMLElement) => (item as SelectionGroupTestItem).buttonElement,
	},
]

describe('SelectionGroup', () => {
	const keyDown = (element: Element, key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))

	// Firefox headless updates `activeElement` but fires no focus events while the document itself is
	// unfocused, so the focusin the cursor tracks has to be delivered by hand.
	const focus = (element: HTMLElement) => {
		element.focus()
		element.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
	}

	for (const kind of kinds) {
		describe(`of ${kind.name}`, () => {
			describe('single selectability', () => {
				const fixture = new ComponentTestFixture<SelectionGroup>(html`
					<mo-selection-group selectability='single' aria-label='View'>
						${['day', 'week', 'month'].map(kind.template)}
					</mo-selection-group>
				`)

				const items = () => fixture.component.items as Array<HTMLElement>
				const controls = () => items().map(kind.control)

				it('should announce itself as a radio group, since one is always chosen', () => {
					expect(fixture.component.getAttribute('role')).toBe('radiogroup')
				})

				it('should announce every item as a radio', () => {
					expect(controls().map(control => control.getAttribute('role'))).toEqual(['radio', 'radio', 'radio'])
				})

				it('should announce the checked state rather than a pressed one', async () => {
					fixture.component.value = 'week'
					await fixture.updateComplete

					expect(controls().map(control => control.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
					expect(controls().every(control => !control.hasAttribute('aria-pressed'))).toBe(true)
				})

				it('should replace the selection when another item is activated', async () => {
					const values = new Array<unknown>()
					fixture.component.addEventListener('change', (e: Event) => values.push((e as CustomEvent).detail))

					kind.control(items()[0]!).click()
					await fixture.updateComplete
					kind.control(items()[2]!).click()
					await fixture.updateComplete

					expect(values).toEqual(['day', 'month'])
					expect(fixture.component.value).toBe('month')
				})

				it('should not clear the selection when the selected item is activated again', async () => {
					kind.control(items()[1]!).click()
					await fixture.updateComplete
					kind.control(items()[1]!).click()
					await fixture.updateComplete

					expect(fixture.component.value).toBe('week')
				})

				it('should hold exactly one tab stop, on the selected item', async () => {
					fixture.component.value = 'month'
					await fixture.updateComplete

					expect(items().map(item => item.tabIndex)).toEqual([-1, -1, 0])
				})

				it('should move focus and the tab stop with the arrow keys, wrapping', async () => {
					await fixture.updateComplete
					focus(items()[0]!)

					keyDown(kind.control(items()[0]!), 'ArrowRight')
					expect(document.activeElement).toBe(items()[1]!)
					expect(items().map(item => item.tabIndex)).toEqual([-1, 0, -1])

					keyDown(kind.control(items()[1]!), 'ArrowLeft')
					keyDown(kind.control(items()[0]!), 'ArrowLeft')
					expect(document.activeElement).toBe(items()[2]!)
				})

				it('should move the cursor without selecting, as the APG asks inside a composite', async () => {
					fixture.component.value = 'day'
					await fixture.updateComplete
					focus(items()[0]!)

					keyDown(kind.control(items()[0]!), 'ArrowRight')
					await fixture.updateComplete

					expect(fixture.component.value).toBe('day')
				})
			})

			describe('single selectability, deselectable', () => {
				const fixture = new ComponentTestFixture<SelectionGroup>(html`
					<mo-selection-group selectability='single' deselectable aria-label='Filter'>
						${['open', 'paid'].map(kind.template)}
					</mo-selection-group>
				`)

				const items = () => fixture.component.items as Array<HTMLElement>

				it('should announce itself as a group of toggles, since it can be emptied', () => {
					expect(fixture.component.getAttribute('role')).toBe('group')
					expect(kind.control(items()[0]!).getAttribute('aria-pressed')).toBe('false')
					expect(kind.control(items()[0]!).hasAttribute('aria-checked')).toBe(false)
				})

				it('should clear the selection when the selected item is activated again', async () => {
					kind.control(items()[0]!).click()
					await fixture.updateComplete
					expect(fixture.component.value).toBe('open')

					kind.control(items()[0]!).click()
					await fixture.updateComplete

					expect(fixture.component.value).toBeUndefined()
				})
			})

			describe('multiple selectability', () => {
				const fixture = new ComponentTestFixture<SelectionGroup>(html`
					<mo-selection-group selectability='multiple' aria-label='Filters'>
						${['a', 'b'].map(kind.template)}
					</mo-selection-group>
				`)

				const items = () => fixture.component.items as Array<HTMLElement>

				it('should announce itself as a group of toggles', () => {
					expect(fixture.component.getAttribute('role')).toBe('group')
				})

				it('should keep the value an array and add to the selection', async () => {
					kind.control(items()[0]!).click()
					await fixture.updateComplete
					kind.control(items()[1]!).click()
					await fixture.updateComplete

					expect(fixture.component.value).toEqual(['a', 'b'])
				})

				it('should remove from the selection when a selected item is activated again', async () => {
					fixture.component.value = ['a', 'b']
					await fixture.updateComplete

					kind.control(items()[0]!).click()
					await fixture.updateComplete

					expect(fixture.component.value).toEqual(['b'])
				})
			})

			describe('without selectability', () => {
				const fixture = new ComponentTestFixture<SelectionGroup>(html`
					<mo-selection-group aria-label='Actions'>
						${['a', 'b'].map(kind.template)}
					</mo-selection-group>
				`)

				const items = () => fixture.component.items as Array<HTMLElement>

				it('should announce itself as a toolbar of commands', () => {
					expect(fixture.component.getAttribute('role')).toBe('toolbar')
				})

				it('should select nothing when an item is activated', async () => {
					kind.control(items()[0]!).click()
					await fixture.updateComplete

					expect(fixture.component.value).toBeUndefined()
				})

				it('should still hold one tab stop and navigate', () => {
					expect(items().map(item => item.tabIndex)).toEqual([0, -1])
				})
			})

			describe('disabled items', () => {
				const fixture = new ComponentTestFixture<SelectionGroup>(html`
					<mo-selection-group selectability='single' aria-label='View'>
						${['a', 'b'].map(kind.template)}
					</mo-selection-group>
				`)

				const items = () => fixture.component.items as Array<HTMLElement & { disabled: boolean }>

				it('should never make a disabled item the tab stop', async () => {
					items()[0]!.disabled = true
					fixture.component.requestUpdate()
					await fixture.updateComplete

					expect(items().map(item => item.tabIndex)).toEqual([-1, 0])
				})
			})
		})
	}

	describe('with items that render their own state', () => {
		const fixture = new ComponentTestFixture<SelectionGroup>(html`
			<mo-selection-group selectability='single' aria-label='View'>
				<selection-group-test-item value='a'>A</selection-group-test-item>
				<selection-group-test-item value='b'>B</selection-group-test-item>
			</mo-selection-group>
		`)

		const items = () => fixture.component.items as Array<SelectionGroupTestItem>

		it('should write the state onto the item rather than onto its host', async () => {
			fixture.component.value = 'b'
			await fixture.updateComplete

			expect(items().map(item => item.selected)).toEqual([false, true])
			expect(items().every(item => !item.hasAttribute('aria-checked'))).toBe(true)
			expect(items().every(item => item.getAttribute('role') === null)).toBe(true)
		})

		it('should refuse the item’s own answer so that only the group writes it', async () => {
			const changes = new Array<unknown>()
			items()[0]!.addEventListener('change', (e: Event) => changes.push((e as CustomEvent).detail))

			items()[0]!.buttonElement.click()
			await fixture.updateComplete

			expect(changes).toEqual([])
			expect(fixture.component.value).toBe('a')
			expect(items()[0]!.selected).toBe(true)
		})

		it('should tell the item which pattern to announce, rather than announcing it for the item', async () => {
			await fixture.updateComplete

			expect(items().map(item => item.buttonElement.getAttribute('role'))).toEqual(['radio', 'radio'])

			fixture.component.deselectable = true
			await fixture.updateComplete

			expect(items().map(item => item.buttonElement.getAttribute('role'))).toEqual([null, null])
			expect(items().map(item => item.buttonElement.getAttribute('aria-pressed'))).toEqual(['false', 'false'])
		})
	})

	describe('removal', () => {
		const fixture = new ComponentTestFixture<SelectionGroup>(html`
			<mo-selection-group aria-label='Tags'>
				<selection-group-test-item value='a'>A</selection-group-test-item>
				<selection-group-test-item value='b'>B</selection-group-test-item>
				<selection-group-test-item value='c'>C</selection-group-test-item>
			</mo-selection-group>
		`)

		it('should move focus to the item that took the removed one’s place', async () => {
			await fixture.updateComplete
			const items = fixture.component.items as Array<SelectionGroupTestItem>
			focus(items[1]!)

			items[1]!.remove()
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve))

			expect(document.activeElement).toBe(fixture.component.items[1]!)
		})

		it('should leave focus alone when it was never inside the group', async () => {
			await fixture.updateComplete
			const outside = document.createElement('button')
			document.body.append(outside)
			outside.focus()

			;(fixture.component.items[0] as SelectionGroupTestItem).remove()
			await fixture.updateComplete
			await new Promise(resolve => setTimeout(resolve))

			expect(document.activeElement).toBe(outside)
			outside.remove()
		})
	})
})