import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { type ListItem } from './ListItem.js'
import type { SelectionListItem } from './SelectionListItem.js'
import './index.js'

describe('ListItem', () => {
	const fixture = new ComponentTestFixture<ListItem>(html`
		<mo-list-item icon='star'>Star item</mo-list-item>
	`)

	const recordClicks = () => {
		const clicks = new Array<Event>()
		fixture.component.addEventListener('click', event => clicks.push(event))
		return clicks
	}

	const keyDown = (key: string, options?: KeyboardEventInit) => {
		const event = new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true, ...options })
		fixture.component.dispatchEvent(event)
		return event
	}

	it('should have the listitem role and take a place in the tab order', () => {
		expect(fixture.component.role).toBe('listitem')
		expect(fixture.component.tabIndex).toBe(0)
	})

	it('should render the icon it was given', () => {
		const icon = fixture.component.renderRoot.querySelector('mo-icon')

		expect(icon?.getAttribute('icon')).toBe('star')
	})

	describe('disabled', () => {
		it('should reflect, block pointer events and leave the tab order when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete

			expect(fixture.component.hasAttribute('disabled')).toBe(true)
			expect(fixture.component.getAttribute('aria-disabled')).toBe('true')
			expect(fixture.component.tabIndex).toBe(-1)
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})
	})

	describe('keyboard activation', () => {
		it('should click itself on Enter, claiming the key', () => {
			const clicks = recordClicks()

			expect(keyDown('Enter').defaultPrevented).toBe(true)

			expect(clicks.length).toBe(1)
		})

		it('should click itself on Space, unless preventClickOnSpace', async () => {
			const clicks = recordClicks()

			keyDown(' ')
			expect(clicks.length).toBe(1)

			fixture.component.preventClickOnSpace = true
			await fixture.updateComplete

			keyDown(' ')
			expect(clicks.length).toBe(1)
		})

		it('should not repeat the activation while the key is held', () => {
			const clicks = recordClicks()

			keyDown('Enter')
			keyDown('Enter', { repeat: true })

			expect(clicks.length).toBe(1)
		})

		it('should leave the keys to a listbox or a menu around it, which activates its own items', () => {
			const clicks = recordClicks()
			const parent = fixture.component.parentNode!
			const listbox = Object.assign(document.createElement('div'), { role: 'listbox' })
			parent.append(listbox)
			listbox.append(fixture.component)
			try {
				expect(keyDown('Enter').defaultPrevented).toBe(false)
				expect(clicks.length).toBe(0)
			} finally {
				parent.append(fixture.component)
				listbox.remove()
			}
		})

		it('should leave a key something inside it already claimed', () => {
			const clicks = recordClicks()
			const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true })
			event.preventDefault()

			fixture.component.dispatchEvent(event)

			expect(clicks.length).toBe(0)
		})
	})
})
describe('ListItem in a plain list', () => {
	const fixture = new ComponentTestFixture(html`
		<div>
			<button id='before'>Before</button>
			<mo-list>
				<mo-list-item>Plain</mo-list-item>
				<mo-checkbox-list-item>Checkbox</mo-checkbox-list-item>
				<mo-switch-list-item>Switch</mo-switch-list-item>
				<mo-radio-list-item>Radio</mo-radio-list-item>
			</mo-list>
		</div>
	`)

	const item = <T = SelectionListItem>(name: string) => [...fixture.component.querySelectorAll('mo-list > *')].find(element => element.textContent?.trim() === name) as T

	for (const name of ['Checkbox', 'Switch', 'Radio']) {
		it(`should toggle the ${name.toLowerCase()} item on a real Enter and Space`, async () => {
			const selectionItem = item(name)
			selectionItem.focus()

			await userEvent.keyboard('{Enter}')
			await selectionItem.updateComplete
			expect(selectionItem.selected).toBe(true)

			if (name !== 'Radio') {
				await userEvent.keyboard(' ')
				await selectionItem.updateComplete
				expect(selectionItem.selected).toBe(false)
			}
		})
	}

	it('should draw the focus ring for keyboard focus, and not for a click', async () => {
		const plain = item<ListItem>('Plain')
		const ring = () => plain.renderRoot.querySelector('mo-focus-ring')

		fixture.component.querySelector<HTMLButtonElement>('#before')!.focus()
		await userEvent.keyboard('{Tab}')
		await plain.updateComplete
		expect(document.activeElement).toBe(plain)
		expect(ring()).not.toBeNull()

		await userEvent.click(item<HTMLElement>('Checkbox'))
		await userEvent.click(plain)
		await plain.updateComplete
		expect(ring()).toBeNull()
	})
})