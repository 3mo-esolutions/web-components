import { ComponentTestFixture } from '@a11d/lit-testing'
import { Radio } from './Radio.js'

describe('Radio', () => {
	const fixture = new ComponentTestFixture<Radio>('mo-radio')

	it('should tunnel "label" to the mwc-formfield element', async () => {
		fixture.component.label = 'test'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('mwc-formfield')?.label).toBe('test')
	})

	it('should tunnel "name" to the mwc-radio element', async () => {
		fixture.component.name = 'test'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('mwc-radio')?.name).toBe('test')
	})

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	it('should tunnel "disabled" to the mwc-radio element', async () => {
		fixture.component.disabled = true
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('mwc-radio')?.disabled).toBe(true)
	})

	it('should tunnel "checked" to the mwc-radio element', async () => {
		fixture.component.checked = true
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('mwc-radio')?.checked).toBe(true)
	})

	it('should dispatch "change" event when value changes through user interaction', async () => {
		let changed = false
		const spy = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed = e.detail)
		fixture.component.addEventListener('change', spy)
		fixture.component.renderRoot.querySelector('mwc-radio')?.click()
		await fixture.update()
		expect(changed).toBe(true)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	describe('integrates with other radio components', () => {
		const fixture1 = new ComponentTestFixture<Radio>('mo-radio')
		const fixture2 = new ComponentTestFixture<Radio>('mo-radio')
		const fixture3 = new ComponentTestFixture<Radio>('mo-radio')

		it('should set "checked" to false when another radio is checked', async () => {
			fixture1.component.checked = true
			await fixture1.component.updateComplete
			fixture2.component.checked = true
			await fixture2.component.updateComplete

			expect(fixture1.component.checked).toBe(false)
			expect(fixture2.component.checked).toBe(true)
		})

		it('should fire "change" event when deselected due to another radio being selected', async () => {
			fixture1.component.checked = true
			await fixture1.component.updateComplete

			let changed1 = false
			const spy1 = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed1 = e.detail)
			fixture1.component.addEventListener('change', spy1)

			let changed2 = false
			const spy2 = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed2 = e.detail)
			fixture2.component.addEventListener('change', spy2)

			fixture3.component.checked = true
			await fixture3.component.updateComplete

			expect(changed1).toBe(false)
			expect(spy1).toHaveBeenCalledTimes(1)

			expect(changed2).toBe(false)
			expect(spy2).not.toHaveBeenCalled()
		})
	})
})