import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Chip } from './Chip.js'
import './index.js'

describe('Chip', () => {
	const keyDown = (element: Element, key: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }))

	const removeButton = (fixture: ComponentTestFixture<Chip>) => fixture.component.renderRoot.querySelector<HTMLButtonElement>('#remove')

	describe('by default', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip>Wholesale</mo-chip>`)

		it('should render its primary action as a native button', () => {
			expect(fixture.component.actionElement.localName).toBe('button')
			expect(fixture.component.actionElement.getAttribute('part')).toBe('button')
		})

		it('should not announce a pressed state unless selectable', () => {
			expect(fixture.component.actionElement.hasAttribute('aria-pressed')).toBe(false)
		})

		it('should render no remove button', () => {
			expect(removeButton(fixture)).toBeFalsy()
		})

		it('should render no action slot to take up space', () => {
			expect(fixture.component.renderRoot.querySelector('slot[name=action]')).toBeNull()
		})

		it('should stamp neither layout attribute, so its label sits symmetrically', () => {
			expect(fixture.component.actionElement.hasAttribute('data-start')).toBe(false)
			expect(fixture.component.actionElement.hasAttribute('data-end')).toBe(false)
		})

		it('should focus the primary action', () => {
			fixture.component.focus()

			expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.actionElement)
		})

		it('should not dispatch change when clicked while not selectable', () => {
			const change = vi.fn()
			fixture.component.addEventListener('change', change)

			fixture.component.actionElement.click()

			expect(change).not.toHaveBeenCalled()
			expect(fixture.component.selected).toBe(false)
		})
	})

	describe('selectable', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip selectable>Open orders</mo-chip>`)

		it('should announce its unselected state', () => {
			expect(fixture.component.actionElement.getAttribute('aria-pressed')).toBe('false')
		})

		it('should toggle and dispatch change when clicked', async () => {
			const states = new Array<boolean>()
			fixture.component.addEventListener('change', (e: Event) => states.push((e as CustomEvent<boolean>).detail))

			fixture.component.actionElement.click()
			await fixture.updateComplete
			expect(fixture.component.selected).toBe(true)
			expect(fixture.component.actionElement.getAttribute('aria-pressed')).toBe('true')

			fixture.component.actionElement.click()
			await fixture.updateComplete
			expect(fixture.component.selected).toBe(false)

			expect(states).toEqual([true, false])
		})

		it('should stamp the leading layout attribute only while it shows the checkmark', async () => {
			expect(fixture.component.actionElement.hasAttribute('data-start')).toBe(false)

			fixture.component.selected = true
			await fixture.updateComplete

			expect(fixture.component.actionElement.hasAttribute('data-start')).toBe(true)
		})

		it('should mount the checkmark whether or not it is selected', () => {
			expect(fixture.component.renderRoot.querySelector('#check')).not.toBeNull()
		})
	})

	describe('selectable with a leading graphic', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip selectable><span slot='start'>@</span>Ada</mo-chip>`)

		const settle = () => fixture.component.renderRoot.querySelectorAll('*')
			.forEach(element => element.getAnimations().forEach(animation => animation.finish()))
		const styleOf = (id: string) => getComputedStyle(fixture.component.renderRoot.querySelector(id)!)
		const sizeOf = (id: string) => styleOf(id).inlineSize

		// Both stay mounted and swap by width. Rendering one in place of the other collapses the
		// outgoing box in the same frame, leaving the deselecting chip nothing to animate.
		it('should swap the leading graphic for the checkmark by width, in both directions', async () => {
			settle()
			expect(sizeOf('#check')).toBe('0px')
			expect(styleOf('#check').opacity).toBe('0')
			expect(sizeOf('#graphic')).not.toBe('0px')
			expect(styleOf('#graphic').opacity).toBe('1')

			fixture.component.selected = true
			await fixture.updateComplete
			settle()
			expect(sizeOf('#check')).not.toBe('0px')
			expect(styleOf('#check').opacity).toBe('1')
			expect(sizeOf('#graphic')).toBe('0px')
			expect(styleOf('#graphic').opacity).toBe('0')

			fixture.component.selected = false
			await fixture.updateComplete
			settle()
			expect(sizeOf('#check')).toBe('0px')
			expect(styleOf('#check').opacity).toBe('0')
			expect(sizeOf('#graphic')).not.toBe('0px')
			expect(styleOf('#graphic').opacity).toBe('1')
		})
	})

	describe('removable', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip removable>Acme GmbH</mo-chip>`)

		it('should label the remove button with the chip’s text', () => {
			expect(removeButton(fixture)!.localName).toBe('button')
			expect(removeButton(fixture)!.getAttribute('aria-label')).toBe('Remove Acme GmbH')
		})

		it('should dispatch a cancelable requestRemove when the remove button is pressed', () => {
			const events = new Array<Event>()
			fixture.component.addEventListener('requestRemove', (e: Event) => events.push(e))

			removeButton(fixture)!.click()

			expect(events.length).toBe(1)
			expect(events[0]!.cancelable).toBe(true)
			expect(events[0]!.bubbles).toBe(true)
		})

		it('should stamp the action layout attribute', () => {
			expect(fixture.component.actionElement.hasAttribute('data-action')).toBe(true)
		})

		it('should not remove itself from the DOM', () => {
			const parent = fixture.component.parentNode

			removeButton(fixture)!.click()

			expect(fixture.component.parentNode).toBe(parent)
		})

		it('should not let a press on the remove button reach the host', () => {
			const click = vi.fn()
			fixture.component.addEventListener('click', click)

			removeButton(fixture)!.click()

			expect(click).not.toHaveBeenCalled()
		})

		for (const key of ['Backspace', 'Delete']) {
			it(`should request removal on ${key}`, () => {
				const requestRemove = vi.fn()
				fixture.component.addEventListener('requestRemove', requestRemove)

				keyDown(fixture.component.actionElement, key)

				expect(requestRemove).toHaveBeenCalledTimes(1)
			})
		}

		it('should move focus between its primary and remove actions with the arrow keys', () => {
			fixture.component.focus()

			keyDown(fixture.component.actionElement, 'ArrowRight')
			expect(fixture.component.shadowRoot!.activeElement).toBe(removeButton(fixture)!)

			keyDown(removeButton(fixture)!, 'ArrowLeft')
			expect(fixture.component.shadowRoot!.activeElement).toBe(fixture.component.actionElement)
		})

		it('should let an arrow key at its edge through to the group', () => {
			fixture.component.focus()

			const notPrevented = keyDown(fixture.component.actionElement, 'ArrowLeft')

			expect(notPrevented).toBe(true)
		})
	})

	describe('readonly', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip readonly>MIT</mo-chip>`)

		it('should render an inert element instead of a button', () => {
			expect(fixture.component.actionElement.localName).toBe('span')
		})

		it('should render no state layer', () => {
			expect(fixture.component.renderRoot.querySelector('md-ripple')).toBeNull()
		})

		it('should not be reachable by keyboard', () => {
			expect(fixture.component.renderRoot.querySelectorAll('button, a').length).toBe(0)
		})
	})

	describe('href', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip href='https://3mo.de' target='_blank'>Docs</mo-chip>`)

		it('should render its primary action as a link', () => {
			expect(fixture.component.actionElement.localName).toBe('a')
			expect(fixture.component.actionElement.getAttribute('href')).toBe('https://3mo.de')
			expect(fixture.component.actionElement.getAttribute('target')).toBe('_blank')
		})
	})

	describe('disabled', () => {
		const fixture = new ComponentTestFixture<Chip>(html`<mo-chip disabled removable>Archived</mo-chip>`)

		it('should disable both of its actions', () => {
			expect((fixture.component.actionElement as HTMLButtonElement).disabled).toBe(true)
			expect(removeButton(fixture)!.disabled).toBe(true)
		})

		it('should not request removal by keyboard', () => {
			const requestRemove = vi.fn()
			fixture.component.addEventListener('requestRemove', requestRemove)

			keyDown(fixture.component.actionElement, 'Delete')

			expect(requestRemove).not.toHaveBeenCalled()
		})
	})

	describe('slots', () => {
		const fixture = new ComponentTestFixture<Chip>(html`
			<mo-chip removable>
				<span slot='start'>Start</span>
				Label
				<button slot='action'>End</button>
			</mo-chip>
		`)

		it('should keep an action outside the button', () => {
			const end = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=action]')!

			expect(fixture.component.actionElement.contains(end)).toBe(false)
			expect(end.assignedElements()).toEqual([fixture.component.querySelector('[slot=action]')!])
		})

		it('should keep the start slot inside the primary action', () => {
			const start = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=start]')!

			expect(fixture.component.actionElement.contains(start)).toBe(true)
		})

		it('should stamp both layout attributes from its slotted content', () => {
			expect(fixture.component.actionElement.hasAttribute('data-start')).toBe(true)
			expect(fixture.component.actionElement.hasAttribute('data-action')).toBe(true)
		})

		it('should label the remove button from the default slot alone', () => {
			expect(removeButton(fixture)!.getAttribute('aria-label')).toBe('Remove Label')
		})
	})
})