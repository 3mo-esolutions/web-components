import { Component, html, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Popover } from './Popover.js'

class PopoverTest extends Component {
	@query('mo-popover') readonly popover!: Popover

	protected override get template() {
		return html`<mo-popover .anchor=${this}>Test</mo-popover>`
	}
}

customElements.define('mo-popover-test', PopoverTest)

describe('Popover', () => {
	const fixture = new ComponentTestFixture(() => new PopoverTest)

	it('should set open and dispatch openChange event when setOpen is called', () => {
		const openChangeSpy = jasmine.createSpy()
		fixture.component.popover.addEventListener<any>('openChange', (e: CustomEvent<boolean>) => openChangeSpy(e.detail))

		fixture.component.popover.setOpen(true)

		expect(fixture.component.popover.open).toBe(true)
		expect(openChangeSpy).toHaveBeenCalledWith(true)
	})

	it('should open on popover hover when openOnHover is true', async () => {
		fixture.component.popover.openOnHover = true

		fixture.component.popover.dispatchEvent(new PointerEvent('pointerenter'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})

	it('should open on anchor hover when openOnHover is true', async () => {
		fixture.component.popover.openOnHover = true

		fixture.component.dispatchEvent(new PointerEvent('pointerenter'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})

	it('should open on anchor focus when openOnFocus is true', async () => {
		fixture.component.popover.openOnFocus = true

		fixture.component.dispatchEvent(new FocusEvent('focusin'))
		await fixture.updateComplete

		expect(fixture.component.popover.open).toBe(true)
	})
})