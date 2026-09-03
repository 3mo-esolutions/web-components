import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldPair, FieldPairMode } from './FieldPair.js'
import './index.js'

describe('FieldPair', () => {
	const fixture = new ComponentTestFixture<FieldPair>(html`
		<mo-field-pair>
			<input>
			<button slot='attachment'>Attach</button>
		</mo-field-pair>
	`)

	const slotNames = () => [...fixture.component.renderRoot.querySelectorAll('slot')].map(slot => slot.getAttribute('name') ?? '')
	const attachmentSlot = () => fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=attachment]')!
	const customProperty = (element: Element, property: string) => getComputedStyle(element).getPropertyValue(property).trim()

	it('should default to attach mode', () => {
		expect(fixture.component.mode).toBe(FieldPairMode.Attach)
	})

	it('should reflect mode and reversed as attributes', async () => {
		expect(fixture.component.getAttribute('mode')).toBe(FieldPairMode.Attach)
		expect(fixture.component.hasAttribute('reversed')).toBeFalse()

		fixture.component.mode = FieldPairMode.Overlay
		fixture.component.reversed = true
		await fixture.updateComplete

		expect(fixture.component.getAttribute('mode')).toBe(FieldPairMode.Overlay)
		expect(fixture.component.hasAttribute('reversed')).toBeTrue()
	})

	describe('slot order', () => {
		it('should render the field before the attachment by default', () => {
			expect(slotNames()).toEqual(['', 'attachment'])
		})

		it('should render the attachment before the field when reversed', async () => {
			fixture.component.reversed = true
			await fixture.updateComplete

			expect(slotNames()).toEqual(['attachment', ''])
		})
	})

	describe('attachment sizing', () => {
		it('should size the attachment slot to 100px by default and honor --mo-field-pair-attachment-width', async () => {
			expect(getComputedStyle(attachmentSlot()).width).toBe('100px')

			fixture.component.style.setProperty('--mo-field-pair-attachment-width', '250px')
			await fixture.updateComplete

			expect(getComputedStyle(attachmentSlot()).width).toBe('250px')
		})
	})

	describe('overlay mode', () => {
		it('should overlay the attachment on the field instead of laying them out side by side', async () => {
			expect(getComputedStyle(fixture.component).display).toBe('flex')
			expect(getComputedStyle(attachmentSlot()).position).toBe('static')

			fixture.component.mode = FieldPairMode.Overlay
			await fixture.updateComplete

			expect(getComputedStyle(fixture.component).display).toBe('block')
			expect(getComputedStyle(attachmentSlot()).position).toBe('absolute')
		})
	})

	describe('corner flattening', () => {
		for (const reversed of [false, true]) {
			it(`should zero the adjoining corner-radius custom properties of the slotted field and attachment when reversed is ${reversed}`, async () => {
				fixture.component.reversed = reversed
				await fixture.updateComplete
				const field = fixture.component.querySelector('input')!
				const attachment = fixture.component.querySelector('[slot=attachment]')!
				const adjoining = reversed ? '--mo-field-border-start-start-radius' : '--mo-field-border-start-end-radius'
				const outer = reversed ? '--mo-field-border-start-end-radius' : '--mo-field-border-start-start-radius'

				expect(customProperty(field, adjoining)).toBe('0px')
				expect(customProperty(field, outer)).toBe('')
				expect(customProperty(attachment, outer)).toBe('0px')
				expect(customProperty(attachment, adjoining)).toBe('')
			})
		}
	})
})