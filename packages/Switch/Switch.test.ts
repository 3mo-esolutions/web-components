import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Switch } from './Switch.js'
import './index.js'

type MdSwitch = HTMLElement & { disabled: boolean, selected: boolean }

describe('Switch', () => {
	const fixture = new ComponentTestFixture<Switch>('mo-switch')

	const mdSwitch = () => fixture.component.renderRoot.querySelector<MdSwitch>('md-switch')!

	const labelElement = () => fixture.component.renderRoot.querySelector('label')

	const spyOnChange = () => {
		const spy = jasmine.createSpy('change')
		fixture.component.addEventListener('change', spy)
		return spy
	}

	describe('disabled', () => {
		it('should set pointer-events to "none" when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should tunnel "disabled" to the md-switch', async () => {
			fixture.component.disabled = true
			await fixture.update()
			expect(mdSwitch().disabled).toBe(true)
		})

		it('should not toggle when a click is dispatched while disabled', async () => {
			fixture.component.disabled = true
			await fixture.update()
			const spy = spyOnChange()

			mdSwitch().click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(false)
			expect(spy).not.toHaveBeenCalled()
		})
	})

	describe('label', () => {
		it('should render its label text', async () => {
			fixture.component.label = 'test'
			await fixture.update()
			expect(labelElement()?.textContent?.trim()).toBe('test')
		})

		it('should render no label element when the label is empty', () => {
			expect(fixture.component.label).toBe('')
			expect(labelElement()).toBeNull()
			expect(mdSwitch()).toBeTruthy()
		})

		it('should toggle when its label is clicked', async () => {
			fixture.component.label = 'test'
			await fixture.update()

			labelElement()!.click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(true)
		})

		it('should toggle exactly once per label click', async () => {
			fixture.component.label = 'test'
			await fixture.update()
			const spy = spyOnChange()

			labelElement()!.click()
			await fixture.updateComplete

			expect(spy).toHaveBeenCalledTimes(1)
			expect(fixture.component.selected).toBe(true)
		})
	})

	describe('selection', () => {
		it('should tunnel "selected" to the md-switch', async () => {
			fixture.component.selected = true
			await fixture.update()
			expect(mdSwitch().selected).toBe(true)
		})

		it('should toggle and dispatch "change" with the new value when the md-switch is clicked', async () => {
			const spy = spyOnChange()

			mdSwitch().click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(true)
			expect(spy).toHaveBeenCalledTimes(1)
			expect(spy.calls.mostRecent().args[0].detail).toBe(true)

			mdSwitch().click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(false)
			expect(spy).toHaveBeenCalledTimes(2)
			expect(spy.calls.mostRecent().args[0].detail).toBe(false)
		})

		it('should not dispatch "change" when "selected" is set programmatically', async () => {
			const spy = spyOnChange()

			fixture.component.selected = true
			await fixture.update()

			expect(fixture.component.selected).toBe(true)
			expect(spy).not.toHaveBeenCalled()
		})

		// `handleClick` does not stop the event, so the composed md-switch click crosses the shadow
		// boundary like any other click — the same contract as mo-radio.
		it('should let the md-switch click reach a "click" listener on the host', async () => {
			const clickSpy = jasmine.createSpy('click')
			fixture.component.addEventListener('click', clickSpy)
			const changeSpy = spyOnChange()

			mdSwitch().click()
			await fixture.updateComplete

			expect(fixture.component.selected).toBe(true)
			expect(clickSpy).toHaveBeenCalledTimes(1)
			expect(changeSpy).toHaveBeenCalledTimes(1)
			expect(changeSpy.calls.mostRecent().args[0].detail).toBe(true)
		})
	})
})