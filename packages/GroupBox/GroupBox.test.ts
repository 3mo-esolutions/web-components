import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type GroupBox } from './GroupBox.js'
import './index.js'

describe('GroupBox', () => {
	const fixture = new ComponentTestFixture<GroupBox>(html`
		<mo-group-box heading='Group'>
			<div>Content</div>
			<div slot='footer'>Footer</div>
		</mo-group-box>
	`)

	const card = () => fixture.component.renderRoot.querySelector('mo-card')!

	beforeEach(async () => {
		await fixture.component.updateComplete
		await card().updateComplete
		await new Promise(resolve => setTimeout(resolve))
	})

	it('should render its content inside a card exposing the "card" part', () => {
		const content = fixture.component.querySelector('div:not([slot])')!

		expect(card().getAttribute('part')).toBe('card')
		expect(content.assignedSlot).not.toBeNull()
		expect(card().contains(content.assignedSlot!)).toBe(true)
	})

	it('should forward the "footer" slot into the card\'s footer', () => {
		const footerSlot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=footer]')!
		const cardFooterSlot = card().renderRoot.querySelector<HTMLSlotElement>('slot[name=footer]')!

		expect(footerSlot.getAttribute('slot')).toBe('footer')
		expect(footerSlot.assignedSlot).toBe(cardFooterSlot)
		expect(cardFooterSlot.hasAttribute('data-empty')).toBe(false)
		expect(getComputedStyle(cardFooterSlot).display).not.toBe('none')
	})

	it('should keep the header outside the card, rendering the "heading" above it', () => {
		const header = fixture.component.renderRoot.querySelector('div[part=header]')!
		const heading = fixture.component.renderRoot.querySelector('mo-heading[part=heading]')!

		expect(card().contains(header)).toBe(false)
		expect(heading.textContent?.trim()).toBe('Group')
		expect(header.contains(heading)).toBe(true)
		expect(header.getBoundingClientRect().bottom).toBeLessThanOrEqual(card().getBoundingClientRect().top)
	})
})