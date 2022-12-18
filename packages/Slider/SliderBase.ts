import { property, css, Component, event, HTMLTemplateResult } from '@a11d/lit'
import { SliderBase as MwcSliderBase, Thumb } from '@material/mwc-slider/slider-base.js'
import '@material/mwc-slider'

export abstract class SliderBase<T> extends Component {
	@event() readonly change!: EventDispatcher<T>
	@event() readonly input!: EventDispatcher<T>

	abstract value: T

	@property({ type: Boolean }) disabled = false
	@property({ type: Boolean }) discrete = false
	@property({ type: Number }) step?: number
	@property({ type: Number }) min?: number
	@property({ type: Number }) max?: number

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			:host([disabled]) {
				pointer-events: none;
			}

			mwc-slider, mwc-slider-range {
				--mdc-theme-primary: var(--mo-slider-accent-color, var(--mo-color-accent, #0077c8));
			}

			mwc-slider::part(marks), mwc-slider-range::part(marks) {
				opacity: 0;
			}
		`
	}

	protected abstract override get template(): HTMLTemplateResult

	protected handleInput(e: CustomEvent<{ readonly value: number, readonly thumb: Thumb }>) {
		e.stopImmediatePropagation()
		this.updateValue(e.detail.value, e.detail.thumb)
		this.input.dispatch(this.value)
	}

	protected handleChange(e: CustomEvent<{ readonly value: number, readonly thumb: Thumb }>) {
		e.stopImmediatePropagation()
		this.updateValue(e.detail.value, e.detail.thumb)
		this.change.dispatch(this.value)
	}

	protected abstract updateValue(value: number, thumb: Thumb): void
}

MwcSliderBase.addInitializer(async component => {
	const slider = component as MwcSliderBase
	await slider.updateComplete
	slider.renderRoot.querySelector('.mdc-slider__tick-marks')?.setAttribute('part', 'marks')
	slider.renderRoot.querySelectorAll('.mdc-slider__thumb')?.forEach(thumb => thumb.setAttribute('part', 'thumb'))
})