import { component, property, html, ifDefined } from '@a11d/lit'
import { SliderBase } from './SliderBase.js'

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
 * @csspart thumb
 *
 * @fires input {CustomEvent<[start: number, end: number]>}
 * @fires change {CustomEvent<[start: number, end: number]>}
 */
@component('mo-range-slider')
export class RangeSlider extends SliderBase<RangeSliderValue> {
	@property({ type: Array }) value: RangeSliderValue = [0, 0]

	protected override get template() {
		const [start, end] = this.value
		return html`
			<md-slider range exportparts='thumb'
				?labeled=${this.discrete}
				?ticks=${this.ticks}
				?disabled=${this.disabled}
				valueStart=${start}
				valueEnd=${end}
				step=${ifDefined(this.step)}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				@input=${this.handleInput.bind(this)}
				@change=${this.handleChange.bind(this)}
			></md-slider>
		`
	}

	protected updateValue() {
		this.value = [
			this.slider.valueStart as number,
			this.slider.valueEnd as number,
		]
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-range-slider': RangeSlider
	}
}