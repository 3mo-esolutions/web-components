import { component, property, html, ifDefined } from '@a11d/lit'
import { SliderBase } from './SliderBase.js'
import { Thumb } from '@material/mwc-slider/slider-range.js'

export type RangeSliderValue = [start: number, end: number]

/**
 * @element mo-range-slider
 *
 * @attr value
 * @attr disabled
 * @attr discrete
 * @attr step
 * @attr min
 * @attr max
 *
 * @csspart parts
 * @csspart thumb
 *
 * @fires input {CustomEvent<[start: number, end: number]>}
 * @fires change {CustomEvent<[start: number, end: number]>}
 */
@component('mo-range-slider')
export class RangeSlider extends SliderBase<RangeSliderValue> {
	@property({ type: Object }) value: RangeSliderValue = [0, 0]

	protected override get template() {
		const [start, end] = this.value
		return html`
			<mwc-slider-range withTickMarks
				?discrete=${this.discrete}
				?disabled=${this.disabled}
				valueStart=${start}
				valueEnd=${end}
				step=${ifDefined(this.step)}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				@input=${this.handleInput.bind(this)}
				@change=${this.handleChange.bind(this)}
			></mwc-slider-range>
		`
	}

	protected updateValue(value: number, thumb: Thumb) {
		const [start, end] = this.value
		this.value = [
			thumb === Thumb.START ? value : start,
			thumb === Thumb.END ? value : end
		]
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-range-slider': RangeSlider
	}
}