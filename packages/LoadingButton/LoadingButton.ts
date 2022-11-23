import { component, css, extractEventHandler, html, nothing, property, style } from '@a11d/lit'
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

	private readonly eventListeners = new Array<{ readonly type: string, readonly handler: EventListenerOrEventListenerObject }>()

	override addEventListener(type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
		this.eventListeners.push({ type, handler })
		super.addEventListener(type, handler, options)
	}

	override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
		this.eventListeners.forEach(({ handler: eventListener, type }, i) => {
			if (type === type && eventListener === listener) {
				delete this.eventListeners[i]
			}
		})
		super.removeEventListener(type, listener, options)
	}

	protected override initialized() {
		this.renderRoot.querySelector('mwc-button')?.addEventListener<any>('click', this.clickHandler)
	}

	private readonly clickHandler = async (e: PointerEvent) => {
		if (this.preventClickEventInference === false) {
			const clickEventHandlers = this.eventListeners
				.filter(({ type }) => type === 'click')
				.map(({ handler }) => extractEventHandler(handler))
				.map(handler => handler(e))
				.filter(Boolean)
			if (clickEventHandlers.length > 0 && this.loading === false) {
				e.stopImmediatePropagation()
				this.loading = true
				await Promise.allSettled(clickEventHandlers)
				this.loading = false
			}
		}
	}

	static override get styles() {
		return css`
			${super.styles}
			mwc-button { position: relative; }
		`
	}

	protected override get contentTemplate() {
		return html`
			${super.contentTemplate}
			${!this.circularProgressReplacesLeadingIcon && this.loading ? this.circularProgressTemplate : nothing}
		`
	}

	protected override get isDisabled() {
		return super.isDisabled || this.loading
	}

	protected override get leadingIconTemplate() {
		return this.circularProgressReplacesLeadingIcon && this.loading ? this.circularProgressTemplate : super.leadingIconTemplate
	}

	protected get circularProgressReplacesLeadingIcon() {
		return !!this.leadingIcon
	}

	private get circularProgressTemplate() {
		return html`
			<mo-circular-progress ${style({
				position: this.circularProgressReplacesLeadingIcon ? undefined : 'absolute',
				top: this.circularProgressReplacesLeadingIcon ? undefined : '50%',
				insetInlineStart: this.circularProgressReplacesLeadingIcon ? undefined : '50%',
				transform: this.circularProgressReplacesLeadingIcon ? undefined : 'translate(-50%, -50%)',
				width: this.circularProgressReplacesLeadingIcon ? '24px' : 'auto',
				height: this.circularProgressReplacesLeadingIcon ? '24px' : '75%',
			})}></mo-circular-progress>
		`
	}
}

// TODO: How to integrate with Dialog in the future?
// MaterialDialog.executingActionAdaptersByComponent.set(LoadingButton, (button, isExecuting) => {
// 	(button as LoadingButton).loading = isExecuting
// })

declare global {
	interface HTMLElementTagNameMap {
		'mo-loading-button': LoadingButton
	}
}