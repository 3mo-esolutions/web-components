import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Color } from '@3mo/color'
import { type ColorPicker } from './ColorPicker.js'
import './index.js'

describe('ColorPicker', () => {
	const fixture = new ComponentTestFixture<ColorPicker>(html`
		<mo-color-picker .value=${new Color('#ff0000')}></mo-color-picker>
	`)

	it('should reflect color value as hex in input element', () => {
		const input = fixture.component.renderRoot.querySelector('input')
		expect(input?.value).toBe('#ff0000')
	})

	it('should dispatch input and change events with Color value', () => {
		const inputSpy = vi.spyOn(fixture.component.input, 'dispatch').mockReturnValue(undefined)
		const changeSpy = vi.spyOn(fixture.component.change, 'dispatch').mockReturnValue(undefined)

		const input = fixture.component.renderRoot.querySelector('input')!
		input.value = '#00ff00'
		input.dispatchEvent(new Event('input'))
		input.dispatchEvent(new Event('change'))

		expect(inputSpy).toHaveBeenCalled()
		expect(changeSpy).toHaveBeenCalled()
	})
})