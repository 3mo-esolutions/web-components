import { property, css, Component, event, HTMLTemplateResult, query } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { MdSlider as MdSliderBase, } from '@material/web/slider/slider.js'
import '@3mo/theme'

export abstract class SliderBase<T> extends Component {
	@event() readonly change!: EventDispatcher<T>
	@event() readonly input!: EventDispatcher<T>

	abstract value: T

	@disabledProperty() disabled = false
	@property({ type: Boolean }) discrete = false
	@property({ type: Boolean }) ticks = false
	@property({ type: Number }) step?: number
	@property({ type: Number }) min?: number
	@property({ type: Number }) max?: number

	@query('md-slider') protected readonly slider!: MdSliderBase

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			md-slider {
				width: 100%;
				--md-slider-active-track-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-active-track-shape: var(--mo-border-radius);
				--md-slider-disabled-active-track-color: var(--mo-color-gray);
				--md-slider-disabled-handle-color: var(--mo-color-gray);
				--md-slider-disabled-handle-elevation: 1;
				--md-slider-disabled-inactive-track-color: var(--mo-color-gray);
				--md-slider-focus-handle-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-handle-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-handle-shape: var(--mo-border-radius);
				--md-slider-hover-handle-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-hover-state-layer-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-inactive-track-color: var(--mo-color-gray);
				--md-slider-inactive-track-shape: var(--mo-border-radius);
				--md-slider-label-container-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-pressed-handle-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-pressed-state-layer-color: var(--mo-slider-accent-color, var(--mo-color-accent));
				--md-slider-with-overlap-handle-outline-color: var(--mo-color-on-accent);
				--md-slider-with-tick-marks-active-container-color: var(--mo-color-on-accent);
				--md-slider-label-text-color: var(--mo-color-on-accent);
				--md-focus-ring-color: var(--mo-slider-accent-color, var(--mo-color-accent));
			}
		`
	}

	protected abstract override get template(): HTMLTemplateResult

	protected handleInput(e: Event) {
		e.stopImmediatePropagation()
		this.updateValue()
		this.input.dispatch(this.value)
	}

	protected handleChange(e: Event) {
		e.stopImmediatePropagation()
		this.updateValue()
		this.change.dispatch(this.value)
	}

	protected abstract updateValue(): void
}

MdSliderBase.addInitializer(async component => {
	const slider = component as MdSliderBase
	await slider.updateComplete
	slider.renderRoot.querySelectorAll('.handle')?.forEach(thumb => thumb.setAttribute('part', 'thumb'))
})