import { ComponentTestFixture } from '@a11d/lit-testing'
import { type IconButton } from './IconButton.js'
import './index.js'

describe('IconButton', () => {
	const fixture = new ComponentTestFixture<IconButton>('mo-icon-button')

	const getMdIconButton = () => fixture.component.renderRoot.querySelector('md-icon-button')!

	const getButton = () => getMdIconButton().renderRoot.querySelector('button') as HTMLButtonElement

	const settle = async () => {
		await fixture.updateComplete
		await getMdIconButton().updateComplete
	}

	const settleFocus = () => new Promise(resolve => setTimeout(resolve))

	describe('icon', () => {
		it('should have an "icon" slot containing a default mo-icon element', () => {
			expect(fixture.component.renderRoot.querySelector('slot[name="icon"]')).toBeTruthy()
			expect(fixture.component.renderRoot.querySelector('slot[name="icon"] > mo-icon')).toBeTruthy()
		})

		it('should reflect "icon" onto the mo-icon element', async () => {
			fixture.component.icon = 'home'
			await fixture.update()
			expect(fixture.component.renderRoot.querySelector('mo-icon')?.icon).toBe('home')
		})
	})

	describe('disabled', () => {
		it('should reflect "disabled" onto the md-icon-button element', async () => {
			fixture.component.disabled = true
			await fixture.update()
			expect(getMdIconButton().disabled).toBe(true)
		})

		it('should set pointer-events to "none" when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should not be focusable while disabled', async () => {
			fixture.component.disabled = true
			await fixture.update()
			await settle()
			; (document.activeElement as HTMLElement | null)?.blur()

			fixture.component.focus()
			await settleFocus()

			expect(getButton().disabled).toBe(true)
			expect(fixture.component.shadowRoot!.activeElement).toBeNull()
			expect(document.activeElement).not.toBe(fixture.component)
		})
	})

	describe('styling', () => {
		it('should have a default font-size of 20px', () => {
			expect(getComputedStyle(fixture.component).fontSize).toBe('20px')
		})

		it('should reflect "cursor" onto the md-icon-button element defaulting to "pointer"', async () => {
			expect(getComputedStyle(fixture.component).cursor).toBe('pointer')
			fixture.component.style.cursor = 'not-allowed'
			await fixture.update()
			expect(getComputedStyle(fixture.component).cursor).toBe('not-allowed')
			expect(getComputedStyle(getMdIconButton()).cursor).toBe('not-allowed')
			expect(getComputedStyle(getButton()).cursor).toBe('not-allowed')
		})

		it('should reduce the padding when "dense"', async () => {
			await settle()
			const padding = parseFloat(getComputedStyle(getButton()).paddingTop)
			expect(padding).toBeGreaterThan(0) // 0.4em of the 20px font-size

			fixture.component.dense = true
			await settle()

			expect(parseFloat(getComputedStyle(getButton()).paddingTop)).toBeCloseTo(padding / 2, 1)
		})

		it('should suppress md\'s 48px touch-target layer, which would otherwise steal neighbouring clicks', async () => {
			await settle()

			const touch = getMdIconButton().renderRoot.querySelector('.touch')
			expect(touch).not.toBeNull()
			expect(getComputedStyle(touch!).display).toBe('none')
		})
	})

	describe('css parts', () => {
		const selectorByPart = new Map([
			['button', 'button'],
			['ripple', 'md-ripple'],
			['focus-ring', 'md-focus-ring'],
		])

		for (const [part, selector] of selectorByPart) {
			it(`should export css part "${part}"`, async () => {
				await settle()

				expect(getMdIconButton().getAttribute('exportparts')).toContain(part)
				expect(getMdIconButton().renderRoot.querySelector(selector)?.getAttribute('part')).toContain(part)
			})
		}
	})

	describe('focus', () => {
		it('should forward focus() to the md-icon-button', async () => {
			await settle()
			; (document.activeElement as HTMLElement | null)?.blur()

			fixture.component.focus()
			await settleFocus()

			expect(fixture.component.shadowRoot!.activeElement).toBe(getMdIconButton())
			expect(document.activeElement).toBe(fixture.component)
		})

		it('should forward blur() to the md-icon-button', async () => {
			await settle()
			fixture.component.focus()
			await settleFocus()
			expect(document.activeElement).toBe(fixture.component)

			fixture.component.blur()
			await settleFocus()

			expect(fixture.component.shadowRoot!.activeElement).toBeNull()
			expect(document.activeElement).not.toBe(fixture.component)
		})
	})
})