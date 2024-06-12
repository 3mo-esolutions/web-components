import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { PopoverAlignment, PopoverPlacement, type PopoverContainer } from '.'
import '.'

describe('PopoverContainer', () => {
	const fixture = new ComponentTestFixture<PopoverContainer>(html`
		<mo-popover-container>
			<button>Open</button>
			<mo-popover slot='popover'>Test</mo-popover>
		</mo-popover-container>
	`)

	it('should set the popover\'s anchor to the container', async () => {
		const popover = fixture.component.querySelector('mo-popover')!
		const button = fixture.component.querySelector('button')!
		expect(popover.anchor).toBe(button)

		button.remove()
		await fixture.updateComplete
		expect(popover.anchor).toBe(undefined)
	})

	it('should delegate fixed, placement, and alignment to the popover', async () => {
		fixture.component.fixed = true
		fixture.component.placement = PopoverPlacement.BlockEnd
		fixture.component.alignment = PopoverAlignment.Center

		await fixture.updateComplete

		const popover = fixture.component.querySelector('mo-popover')!
		expect(popover.fixed).toBe(true)
		expect(popover.placement).toBe(PopoverPlacement.BlockEnd)
		expect(popover.alignment).toBe(PopoverAlignment.Center)
	})
})