import { component, html, ifDefined, property } from '@a11d/lit'
import { SliderBase } from './SliderBase.js'

/**
 * A slider for choosing a number from a range by dragging a thumb.
 *
 * @element mo-slider
 *
 * @ssr true
 *
 * @attr value - The selected number
 * @attr disabled - Turns the slider gray and makes it ignore input
 * @attr discrete - Shows the value above the thumb while it is dragged
 * @attr ticks - Marks every step on the track
 * @attr step - The distance between two selectable values, 1 by default
 * @attr min - The smallest selectable value, 0 by default
 * @attr max - The largest selectable value, 100 by default
 *
 * @csspart thumb - The handle that is dragged
 *
 * @cssprop --mo-slider-accent-color - The color of the active track, the thumb and the value label
 *
 * @fires input - Dispatched with the value while the thumb is dragged
 * @fires change - Dispatched with the value when the thumb is released
 */
@component('mo-slider')
export class Slider extends SliderBase<number> {
	@property({ type: Number, bindingDefault: true }) value = 0

	protected override get template() {
		return html`
			<md-slider exportparts='thumb'
				?labeled=${this.discrete}
				?ticks=${this.ticks}
				?disabled=${this.disabled}
				value=${this.value}
				step=${ifDefined(this.step)}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				@input=${this.handleInput.bind(this)}
				@change=${this.handleChange.bind(this)}
			></md-slider>
		`
	}

	protected updateValue() {
		this.value = this.slider.value as number
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-slider': Slider
	}
}