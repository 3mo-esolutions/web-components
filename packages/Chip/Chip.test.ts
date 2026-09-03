import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Chip } from './Chip.js'
import './index.js'

describe('Chip', () => {
	const fixture = new ComponentTestFixture<Chip>(html`
		<mo-chip>
			<span slot='start'>Start</span>
			<span>Chip Label</span>
			<span slot='end'>End</span>
		</mo-chip>
	`)

	const button = () => fixture.component.renderRoot.querySelector('mo-button')!

	beforeEach(async () => {
		await fixture.component.updateComplete
		await button().updateComplete
		await new Promise(resolve => setTimeout(resolve, 20))
	})

	for (const slotName of ['start', '', 'end']) {
		it(`should forward its "${slotName || 'default'}" slot into the underlying button`, () => {
			const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>(slotName ? `slot[name=${slotName}]` : 'slot:not([name])')!
			const slotted = fixture.component.querySelector(slotName ? `[slot=${slotName}]` : 'span:not([slot])')!

			expect(slot.assignedElements()).toEqual([slotted])
			expect(slot.assignedSlot?.name).toBe(slotName)
			expect(button().renderRoot.contains(slot.assignedSlot!)).toBe(true)
		})
	}

	it('should export the "ripple" part through the underlying button', () => {
		const styleElement = document.createElement('style')
		styleElement.textContent = 'mo-chip::part(ripple) { --chip-ripple-probe: exported; }'
		document.head.appendChild(styleElement)

		try {
			const materialButton = button().renderRoot.querySelector('md-filled-button')!
			const ripple = materialButton.shadowRoot!.querySelector('[part~=ripple]')!

			expect(button().getAttribute('exportparts')).toContain('ripple')
			expect(getComputedStyle(ripple).getPropertyValue('--chip-ripple-probe').trim()).toBe('exported')
		} finally {
			styleElement.remove()
		}
	})
})