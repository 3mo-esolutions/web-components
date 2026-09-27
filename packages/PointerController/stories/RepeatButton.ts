import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { PointerRepeatController } from '@3mo/pointer-controller'

/** A stepper button: the pointer goes through the controller, the keyboard through a keydown handler, which the platform already repeats. */
@component('story-repeat-button')
export class RepeatButton extends Component {
	@event() readonly trigger!: EventDispatcher<number>

	@property({ type: Boolean }) repeat = false
	@property({ type: Number }) delay = PointerRepeatController.defaultDelay
	@property({ type: Number }) interval = PointerRepeatController.defaultInterval

	readonly repeatController = new PointerRepeatController(this, host => ({
		get delay() { return host.delay },
		get interval() { return host.interval },
		handleTrigger: repetition => host.handleTrigger(repetition),
	}))

	private keyRepetition = 0

	private handleTrigger(repetition: number) {
		if (repetition === 0 || this.repeat) {
			this.trigger.dispatch(repetition)
		}
	}

	@eventListener('keydown')
	protected handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			this.handleTrigger(this.keyRepetition++)
		}
	}

	@eventListener('keyup')
	protected handleKeyUp() {
		this.keyRepetition = 0
	}

	static override get styles() {
		return css`
			:host {
				display: inline-grid;
				place-content: center;
				inline-size: 2.25rem;
				block-size: 2.25rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-3);
				color: var(--mo-color-foreground);
				font-size: 1.25rem;
				cursor: pointer;
				user-select: none;
				touch-action: manipulation;
			}

			:host(:focus-visible) { outline: 2px solid var(--mo-color-accent); outline-offset: 2px; }
			:host([data-pressed]) { background: var(--mo-color-accent); color: var(--mo-color-on-accent); }
		`
	}

	protected override connected() {
		this.tabIndex = 0
		this.setAttribute('role', 'button')
	}

	protected override updated() {
		this.toggleAttribute('data-pressed', this.repeatController.press)
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}