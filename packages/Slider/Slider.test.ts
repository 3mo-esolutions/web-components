import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Slider } from './Slider.js'
import './index.js'

type MdSlider = HTMLElement & {
	value: number
	step: number
	min: number
	max: number
	disabled: boolean
	labeled: boolean
	ticks: boolean
	updateComplete: Promise<unknown>
}

describe('Slider', () => {
	const fixture = new ComponentTestFixture<Slider>('mo-slider')

	const mdSlider = () => fixture.component.renderRoot.querySelector<MdSlider>('md-slider')!

	const spyOnEvent = (type: 'input' | 'change') => {
		const spy = jasmine.createSpy(type)
		fixture.component.addEventListener(type, spy)
		return spy
	}

	describe('value', () => {
		it('should default to 0', () => {
			expect(fixture.component.value).toBe(0)
			expect(mdSlider().value).toBe(0)
		})

		it('should tunnel the value to the underlying md-slider', async () => {
			fixture.component.value = 25
			await fixture.update()

			expect(mdSlider().value).toBe(25)
		})

		it('should not dispatch input or change on programmatic assignment', async () => {
			const inputSpy = spyOnEvent('input')
			const changeSpy = spyOnEvent('change')

			fixture.component.value = 25
			await fixture.update()

			expect(inputSpy).not.toHaveBeenCalled()
			expect(changeSpy).not.toHaveBeenCalled()
		})
	})

	describe('user interaction', () => {
		it('should update the value and dispatch a single input event carrying the number when the internal slider inputs', async () => {
			const spy = spyOnEvent('input')

			mdSlider().value = 42
			mdSlider().dispatchEvent(new Event('input', { bubbles: true, composed: true }))
			await fixture.updateComplete

			expect(fixture.component.value).toBe(42)
			expect(spy).toHaveBeenCalledTimes(1)
			expect(spy.calls.mostRecent().args[0].detail).toBe(42)
		})

		it('should update the value and dispatch a single change event carrying the number when the internal slider commits', async () => {
			const spy = spyOnEvent('change')

			mdSlider().value = 42
			mdSlider().dispatchEvent(new Event('change', { bubbles: true }))
			await fixture.updateComplete

			expect(fixture.component.value).toBe(42)
			expect(spy).toHaveBeenCalledTimes(1)
			expect(spy.calls.mostRecent().args[0].detail).toBe(42)
		})
	})

	describe('constraints tunneling', () => {
		const constraints = [
			['step', 5],
			['min', 10],
			['max', 90],
		] as Array<[keyof Slider & ('step' | 'min' | 'max'), number]>

		for (const [constraint, value] of constraints) {
			it(`should tunnel "${constraint}" to the underlying md-slider`, async () => {
				fixture.component[constraint] = value
				await fixture.update()

				expect(mdSlider()[constraint]).toBe(value)
			})
		}

		it('should disable the underlying md-slider when disabled', async () => {
			fixture.component.disabled = true
			await fixture.update()

			expect(mdSlider().disabled).toBe(true)
		})

		const flags = [
			['discrete', 'labeled'],
			['ticks', 'ticks'],
		] as Array<[keyof Slider & ('discrete' | 'ticks'), 'labeled' | 'ticks']>

		for (const [property, mdProperty] of flags) {
			it(`should set "${mdProperty}" on the underlying md-slider when "${property}" is set`, async () => {
				expect(mdSlider()[mdProperty]).toBe(false)

				fixture.component[property] = true
				await fixture.update()

				expect(mdSlider()[mdProperty]).toBe(true)
			})
		}
	})

	describe('csspart', () => {
		it('should expose the handle as part "thumb"', async () => {
			await mdSlider().updateComplete
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(mdSlider().getAttribute('exportparts')?.split(',')).toContain('thumb')
			expect(mdSlider().shadowRoot!.querySelector('.handle')?.getAttribute('part')?.split(' ')).toContain('thumb')
		})
	})
})