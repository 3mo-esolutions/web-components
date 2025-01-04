import { EventListenerController, component, css, extractEventHandler, html, property, queryAsync, style } from '@a11d/lit'
import { Button } from '@3mo/button'
import '@3mo/circular-progress'

/**
 * @attr loading
 * @attr preventClickEventInference
 */
@component('mo-loading-button')
export class LoadingButton extends Button {
	@property({ type: Boolean, reflect: true }) loading = false
	@property({ type: Boolean }) preventClickEventInference = false

	private readonly clickEventListeners = new Set<EventListenerOrEventListenerObject>()

	override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
		if (type === 'click') {
			this.clickEventListeners.add(listener)
		}
		super.addEventListener(type, listener, options)
	}

	override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
		if (type === 'click') {
			this.clickEventListeners.delete(listener)
		}
		super.removeEventListener(type, listener, options)
	}

	@queryAsync('[md-button]') private readonly button!: Promise<HTMLButtonElement>

	protected readonly clickEventListenerController = new EventListenerController(this, {
		type: 'click',
		target: () => this.button,
		listener: async (e: PointerEvent) => {
			if (this.preventClickEventInference === false) {
				const results = [...this.clickEventListeners]
					.map(listener => extractEventHandler(listener)(e))
					.filter(Boolean)
				if (results.length > 0 && this.loading === false) {
					e.stopImmediatePropagation()
					this.loading = true
					await Promise.allSettled(results)
					this.loading = false
				}
			}
		},
	})

	static override get styles() {
		return css`
			${super.styles}
			:host([loading]) { pointer-events: none; }
			[md-button] { position: relative; }
		`
	}

	protected override get contentTemplate() {
		return html`
			${super.contentTemplate}
			${!this.circularProgressReplacesStartIcon && this.loading ? this.circularProgressTemplate : html.nothing}
		`
	}

	protected override get isDisabled() {
		return super.isDisabled || this.loading
	}

	protected override get startIconTemplate() {
		return this.circularProgressReplacesStartIcon && this.loading ? this.circularProgressTemplate : super.startIconTemplate
	}

	protected get circularProgressReplacesStartIcon() {
		return !!this.startIcon
	}

	private get circularProgressTemplate() {
		return html`
			<mo-circular-progress ${style({
				position: this.circularProgressReplacesStartIcon ? undefined : 'absolute',
				top: this.circularProgressReplacesStartIcon ? undefined : '50%',
				insetInlineStart: this.circularProgressReplacesStartIcon ? undefined : '50%',
				transform: this.circularProgressReplacesStartIcon ? undefined : getComputedStyle(this).direction === 'rtl' ? 'translate(+50%, -50%)' : 'translate(-50%, -50%)',
				width: this.circularProgressReplacesStartIcon ? '24px' : 'auto',
				height: this.circularProgressReplacesStartIcon ? '24px' : '75%',
			})}></mo-circular-progress>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-loading-button': LoadingButton
	}
}