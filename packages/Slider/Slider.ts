import { component, html, ifDefined, property } from '@a11d/lit'
import { SliderBase } from './SliderBase.js'

/**
 * @element mo-slider
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
 * @fires input {CustomEvent<number>}
 * @fires change {CustomEvent<number>}
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