import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type ListItem } from './index.js'

describe('ListItem', () => {
	const fixture = new ComponentTestFixture<ListItem>(html`
		<mo-list-item icon='star'>Star item</mo-list-item>
	`)

	const ripple = () => fixture.component.renderRoot.querySelector('mo-list-item-ripple')!

	const markFocused = async () => {
		fixture.component.toggleAttribute('focused', true)
		await fixture.updateComplete
		await ripple().updateComplete
	}

	const recordClicks = () => {
		const clicks = new Array<Event>()
		fixture.component.addEventListener('click', event => clicks.push(event))
		return clicks
	}

	const keyDown = (key: string, options?: KeyboardEventInit) =>
		window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))

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
		it('should dispatch a click on Enter while marked focused', async () => {
			await markFocused()
			const clicks = recordClicks()

			keyDown('Enter')

			expect(clicks.length).toBe(1)
		})

		it('should dispatch a click on Space, unless preventClickOnSpace', async () => {
			await markFocused()
			const clicks = recordClicks()

			keyDown(' ')
			expect(clicks.length).toBe(1)

			fixture.component.preventClickOnSpace = true
			await fixture.updateComplete
			await ripple().updateComplete

			keyDown(' ')
			expect(clicks.length).toBe(1)
		})

		it('should not activate while disabled or while not focused', async () => {
			const clicks = recordClicks()

			keyDown('Enter')
			expect(clicks.length).toBe(0)

			fixture.component.disabled = true
			await markFocused()

			keyDown('Enter')
			expect(clicks.length).toBe(0)
		})

		it('should not repeat the activation while the key is held', async () => {
			await markFocused()
			const clicks = recordClicks()

			keyDown('Enter')
			keyDown('Enter', { repeat: true })

			expect(clicks.length).toBe(1)
		})
	})

	describe('focus visuals', () => {
		const focusRing = () => fixture.component.renderRoot.querySelector('mo-focus-ring')

		it('should show the focus ring only for keyboard focus (focused together with data-keyboard-focus)', async () => {
			await markFocused()
			expect(focusRing()).toBeNull()

			fixture.component.toggleAttribute('data-keyboard-focus', true)
			await fixture.update()

			expect(focusRing()).not.toBeNull()
		})
	})
})