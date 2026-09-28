import { component, property, html, ifDefined } from '@a11d/lit'
import { SliderBase } from './SliderBase.js'

export type RangeSliderValue = [start: number, end: number]

/**
 * A slider with two thumbs for choosing a range of numbers.
 *
 * @element mo-range-slider
 *
 * @ssr true
 *
 * @attr value - The start and end of the selected range, e.g. "[20, 80]"
 * @attr disabled - Turns the slider gray and makes it ignore input
 * @attr discrete - Shows the values above the thumbs while they are dragged
 * @attr ticks - Marks every step on the track
 * @attr step - The distance between two selectable values, 1 by default
 * @attr min - The smallest selectable value, 0 by default
 * @attr max - The largest selectable value, 100 by default
 *
 * @csspart thumb - The handles that are dragged
 *
 * @cssprop --mo-slider-accent-color - The color of the active track, the thumbs and the value labels
 *
 * @fires input - Dispatched with the value while a thumb is dragged
 * @fires change - Dispatched with the value when a thumb is released
 */
@component('mo-range-slider')
export class RangeSlider extends SliderBase<RangeSliderValue> {
	@property({ type: Array, bindingDefault: true }) value: RangeSliderValue = [0, 0]

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