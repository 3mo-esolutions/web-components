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
 * @csspart parts
 * @csspart thumb
 *
 * @fires input {CustomEvent<number>}
 * @fires change {CustomEvent<number>}
 */
@component('mo-slider')
export class Slider extends SliderBase<number> {
	@property({ type: Number }) value = 0

	protected override get template() {
		return html`
			<mwc-slider withTickMarks
				?discrete=${this.discrete}
				?disabled=${this.disabled}
				value=${this.value}
				step=${ifDefined(this.step)}
				min=${ifDefined(this.min)}
				max=${ifDefined(this.max)}
				@input=${this.handleInput.bind(this)}
				@change=${this.handleChange.bind(this)}
			></mwc-slider>
		`
	}

	protected updateValue(value: number) {
		this.value = value
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-slider': Slider
	}
}