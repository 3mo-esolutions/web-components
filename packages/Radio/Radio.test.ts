import { ComponentTestFixture } from '@a11d/lit-testing'
import { Component, component, html } from '@a11d/lit'
import { type Radio } from './Radio.js'

@component('mo-test-radio-shadow-host')
class TestRadioShadowHost extends Component {
	get radio() { return this.renderRoot.querySelector('mo-radio') }

	protected override get template() {
		return html`<mo-radio name='cross-root'></mo-radio>`
	}
}

@component('mo-test-radio-group')
class TestRadioGroup extends Component {
	get radios() { return [...this.renderRoot.querySelectorAll('mo-radio')] }

	protected override get template() {
		return html`
			<mo-radio name='keyboard'></mo-radio>
			<mo-radio name='keyboard'></mo-radio>
			<mo-radio name='keyboard'></mo-radio>
		`
	}
}

@component('mo-test-radio-group-with-disabled')
class TestRadioGroupWithDisabled extends Component {
	get radios() { return [...this.renderRoot.querySelectorAll('mo-radio')] }

	protected override get template() {
		return html`
			<mo-radio name='keyboard-disabled'></mo-radio>
			<mo-radio name='keyboard-disabled' disabled></mo-radio>
			<mo-radio name='keyboard-disabled'></mo-radio>
		`
	}
}

const tabIndexOf = (radio: Radio) => radio.renderRoot.querySelector('md-radio')?.tabIndex

const pressKey = (radio: Radio, key: string) => radio.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }))

describe('Radio', () => {
	const fixture = new ComponentTestFixture<Radio>('mo-radio')

	it('should tunnel "label" to the label element', async () => {
		fixture.component.label = 'test'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('label')?.textContent?.trim()).toBe('test')
	})

	it('should tunnel "name" to the md-radio element', async () => {
		fixture.component.name = 'test'
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('md-radio')?.name).toBe('test')
	})

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	it('should tunnel "disabled" to the md-radio element', async () => {
		fixture.component.disabled = true
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('md-radio')?.disabled).toBe(true)
	})

	it('should tunnel "selected" to the md-radio element', async () => {
		fixture.component.selected = true
		await fixture.update()
		expect(fixture.component.renderRoot.querySelector('md-radio')?.checked).toBe(true)
	})

	it('should dispatch "change" event when value changes through user interaction', async () => {
		let changed = false
		const spy = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed = e.detail)
		fixture.component.addEventListener('change', spy)
		fixture.component.renderRoot.querySelector('md-radio')?.click()
		await fixture.update()
		expect(changed).toBe(true)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('should select when its label is clicked', async () => {
		fixture.component.label = 'test'
		await fixture.update()
		const spy = jasmine.createSpy('change')
		fixture.component.addEventListener('change', spy)

		fixture.component.renderRoot.querySelector('label')?.click()
		await fixture.update()

		expect(fixture.component.selected).toBe(true)
		expect(spy).toHaveBeenCalledTimes(1)
	})

	it('should associate its label with the md-radio element', async () => {
		// What makes a click anywhere in the 40px box select the radio: `md-radio` is form-associated,
		// so the browser forwards label activation to it.
		const radioElement = fixture.component.renderRoot.querySelector('md-radio')
		const label = fixture.component.renderRoot.querySelector('label')
		expect([...radioElement!.labels]).toContain(label!)
	})

	it('should not dispatch "change" event when "selected" is set programmatically', async () => {
		const spy = jasmine.createSpy('change')
		fixture.component.addEventListener('change', spy)
		fixture.component.selected = true
		await fixture.update()
		expect(fixture.component.selected).toBe(true)
		expect(spy).not.toHaveBeenCalled()
	})

	describe('integrates with other radio components', () => {
		const fixture1 = new ComponentTestFixture<Radio>('mo-radio')
		const fixture2 = new ComponentTestFixture<Radio>('mo-radio')
		const fixture3 = new ComponentTestFixture<Radio>('mo-radio')

		it('should set "selected" to false when another radio is selected', async () => {
			fixture1.component.selected = true
			await fixture1.component.updateComplete
			fixture2.component.selected = true
			await fixture2.component.updateComplete

			expect(fixture1.component.selected).toBe(false)
			expect(fixture2.component.selected).toBe(true)
		})

		it('should fire "change" event when deselected due to another radio being selected', async () => {
			fixture1.component.selected = true
			await fixture1.component.updateComplete

			let changed1 = false
			const spy1 = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed1 = e.detail)
			fixture1.component.addEventListener('change', spy1)

			let changed2 = false
			const spy2 = jasmine.createSpy('change').and.callFake((e: CustomEvent<boolean>) => changed2 = e.detail)
			fixture2.component.addEventListener('change', spy2)

			fixture3.component.selected = true
			await fixture3.component.updateComplete

			expect(changed1).toBe(false)
			expect(spy1).toHaveBeenCalledTimes(1)

			expect(changed2).toBe(false)
			expect(spy2).not.toHaveBeenCalled()
		})

		it('should settle on the radio selected last when several are selected in one tick', async () => {
			fixture1.component.selected = true
			fixture2.component.selected = true
			fixture3.component.selected = true
			await fixture3.component.updateComplete

			expect(fixture1.component.selected).toBe(false)
			expect(fixture2.component.selected).toBe(false)
			expect(fixture3.component.selected).toBe(true)
		})

		it('should only group radios sharing a "name"', async () => {
			fixture1.component.name = 'one'
			fixture2.component.name = 'one'
			fixture3.component.name = 'two'
			await Promise.all([fixture1.component.updateComplete, fixture2.component.updateComplete, fixture3.component.updateComplete])

			fixture1.component.selected = true
			fixture3.component.selected = true
			await Promise.all([fixture1.component.updateComplete, fixture3.component.updateComplete])

			expect(fixture1.component.selected).toBe(true)
			expect(fixture3.component.selected).toBe(true)

			fixture2.component.selected = true
			await fixture2.component.updateComplete

			expect(fixture1.component.selected).toBe(false)
			expect(fixture2.component.selected).toBe(true)
			expect(fixture3.component.selected).toBe(true)
		})
	})

	describe('across shadow roots', () => {
		const outerFixture = new ComponentTestFixture<Radio>(html`<mo-radio name='cross-root'></mo-radio>`)
		const hostFixture = new ComponentTestFixture<TestRadioShadowHost>('mo-test-radio-shadow-host')

		it('should deselect a radio grouped by name in another shadow root', async () => {
			const inner = hostFixture.component.radio!

			outerFixture.component.selected = true
			await outerFixture.component.updateComplete
			expect(inner.selected).toBe(false)

			inner.selected = true
			await inner.updateComplete

			expect(outerFixture.component.selected).toBe(false)
			expect(inner.selected).toBe(true)
		})
	})

	describe('keyboard navigation', () => {
		const groupFixture = new ComponentTestFixture<TestRadioGroup>('mo-test-radio-group')

		it('should make the selected radio the group\'s only tab stop', async () => {
			const radios = groupFixture.component.radios
			expect(radios.map(tabIndexOf)).toEqual([0, 0, 0])

			radios[1]!.selected = true
			await Promise.all(radios.map(radio => radio.updateComplete))

			expect(radios.map(tabIndexOf)).toEqual([-1, 0, -1])
		})

		it('should select the next radio on ArrowDown and the previous one on ArrowUp', async () => {
			const radios = groupFixture.component.radios
			radios[0]!.selected = true
			await Promise.all(radios.map(radio => radio.updateComplete))

			pressKey(radios[0]!, 'ArrowDown')
			expect(radios.map(radio => radio.selected)).toEqual([false, true, false])

			pressKey(radios[1]!, 'ArrowUp')
			expect(radios.map(radio => radio.selected)).toEqual([true, false, false])
		})

		it('should wrap around at the group\'s edges', () => {
			const radios = groupFixture.component.radios

			pressKey(radios[0]!, 'ArrowUp')
			expect(radios.map(radio => radio.selected)).toEqual([false, false, true])

			pressKey(radios[2]!, 'ArrowDown')
			expect(radios.map(radio => radio.selected)).toEqual([true, false, false])
		})

		it('should dispatch "change" on both the selected and the deselected radio', async () => {
			const radios = groupFixture.component.radios
			radios[0]!.selected = true
			await Promise.all(radios.map(radio => radio.updateComplete))

			const spy0 = jasmine.createSpy('change')
			const spy1 = jasmine.createSpy('change')
			radios[0]!.addEventListener('change', spy0)
			radios[1]!.addEventListener('change', spy1)

			pressKey(radios[0]!, 'ArrowDown')

			expect(spy0).toHaveBeenCalledTimes(1)
			expect(spy0.calls.mostRecent().args[0].detail).toBe(false)
			expect(spy1).toHaveBeenCalledTimes(1)
			expect(spy1.calls.mostRecent().args[0].detail).toBe(true)
		})

		it('should ignore keys other than the arrow keys', () => {
			const radios = groupFixture.component.radios
			pressKey(radios[0]!, 'Tab')
			expect(radios.map(radio => radio.selected)).toEqual([false, false, false])
		})

		describe('with a disabled radio', () => {
			const disabledGroupFixture = new ComponentTestFixture<TestRadioGroupWithDisabled>('mo-test-radio-group-with-disabled')

			it('should skip it', () => {
				const radios = disabledGroupFixture.component.radios

				pressKey(radios[0]!, 'ArrowDown')

				expect(radios.map(radio => radio.selected)).toEqual([false, false, true])
			})

			it('should never make it a tab stop', async () => {
				const radios = disabledGroupFixture.component.radios
				expect(radios.map(tabIndexOf)).toEqual([0, -1, 0])

				radios[0]!.selected = true
				await Promise.all(radios.map(radio => radio.updateComplete))

				expect(radios.map(tabIndexOf)).toEqual([0, -1, -1])
			})
		})
	})

	describe('when "name" changes', () => {
		const fixture1 = new ComponentTestFixture<Radio>('mo-radio')
		const fixture2 = new ComponentTestFixture<Radio>('mo-radio')

		it('should take over the group it joins', async () => {
			fixture1.component.name = 'joined'
			fixture2.component.name = 'elsewhere'
			fixture1.component.selected = true
			fixture2.component.selected = true
			await Promise.all([fixture1.component.updateComplete, fixture2.component.updateComplete])
			expect([fixture1.component.selected, fixture2.component.selected]).toEqual([true, true])

			fixture2.component.name = 'joined'
			await fixture2.component.updateComplete

			expect(fixture1.component.selected).toBe(false)
			expect(fixture2.component.selected).toBe(true)
		})

		it('should leave the group it departs tabbable', async () => {
			fixture1.component.name = 'departed'
			fixture2.component.name = 'departed'
			await Promise.all([fixture1.component.updateComplete, fixture2.component.updateComplete])

			fixture2.component.selected = true
			await Promise.all([fixture1.component.updateComplete, fixture2.component.updateComplete])
			expect([fixture1.component, fixture2.component].map(tabIndexOf)).toEqual([-1, 0])

			fixture2.component.name = 'somewhere-else'
			await Promise.all([fixture1.component.updateComplete, fixture2.component.updateComplete])

			// When departing a group with no other selection, the remaining radio becomes reachable again
			expect(tabIndexOf(fixture1.component)).toBe(0)
		})
	})
})