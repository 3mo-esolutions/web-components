import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, event, eventListener, html, property, state } from '@a11d/lit'
import p from './package.json'
import { PointerRepeatController } from './PointerRepeatController.js'

export default {
	title: 'Utilities / Pointer Repeat Controller',
	package: p,
} as Meta

/** A stepper button: the pointer goes through the controller, the keyboard through a keydown
 * handler, which the platform already repeats on its own. */
@component('story-repeat-button')
class StoryRepeatButton extends Component {
	@property({ type: Boolean }) repeat = false
	@property({ type: Number }) delay = PointerRepeatController.defaultDelay
	@property({ type: Number }) interval = PointerRepeatController.defaultInterval

	@event() readonly trigger!: EventDispatcher<number>

	readonly repeatController = new PointerRepeatController(this, host => ({
		get delay() { return host.delay },
		get interval() { return host.interval },
		handleTrigger: repetition => host.handleTrigger(repetition),
	}))

	private handleTrigger(repetition: number) {
		if (repetition === 0 || this.repeat) {
			this.trigger.dispatch(repetition)
		}
	}

	private keyRepetition = 0

	@eventListener('keydown')
	protected handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault()
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

	protected override get template() {
		this.tabIndex = 0
		this.toggleAttribute('data-pressed', this.repeatController.press)
		return html`<slot></slot>`
	}
}

const stepperStyles = css`
	:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }
	.panel { display: flex; flex-direction: column; gap: 0.75rem; }
	.stepper { display: flex; align-items: center; gap: 0.5rem; }
	.value {
		min-inline-size: 5rem;
		padding: 0.35rem 0.75rem;
		border-radius: var(--mo-border-radius);
		border: 1px solid var(--mo-color-transparent-gray-3);
		font-variant-numeric: tabular-nums;
		font-size: 1.1rem;
		text-align: end;
	}
	h4 { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }
	.hint { color: var(--mo-color-gray); font-size: small; line-height: 1.6; max-inline-size: 30rem; }
	code { color: var(--mo-color-accent); }
	.readout { font-variant-numeric: tabular-nums; color: var(--mo-color-gray); font-size: small; }
`

/** Two identical steppers, one of which listens to the repetitions. */
@component('story-repeat-comparison')
class StoryRepeatComparison extends Component {
	@state() private plain = 0
	@state() private held = 0

	static override get styles() { return stepperStyles }

	private stepper(repeat: boolean, value: number, step: (by: number) => void) {
		return html`
			<div class='panel'>
				<h4>${repeat ? 'with press-and-hold' : 'press only'}</h4>
				<div class='stepper'>
					<story-repeat-button ?repeat=${repeat} @trigger=${() => step(-1)}>−</story-repeat-button>
					<div class='value'>${value}</div>
					<story-repeat-button ?repeat=${repeat} @trigger=${() => step(1)}>+</story-repeat-button>
				</div>
			</div>
		`
	}

	protected override get template() {
		return html`
			${this.stepper(false, this.plain, by => this.plain += by)}
			${this.stepper(true, this.held, by => this.held += by)}
			<p class='hint'>
				Hold either <b>+</b> down. The left one steps once per press, the right one keeps going
				after <code>500ms</code>. Both behave identically when you simply click.
				<br><br>
				Now <b>tab</b> to a button and hold <b>Enter</b>: both sides repeat, because a held key
				already arrives over and over. That asymmetry is what this controller closes.
			</p>
		`
	}
}

StoryRepeatComparison

export const NumberStepper: StoryObj = {
	render: () => html`<story-repeat-comparison></story-repeat-comparison>`
}

/** The trigger is handed the number of triggers which came before it, so a long hold can cover more
 * ground without the controller having an opinion about how. */
@component('story-repeat-acceleration')
class StoryRepeatAcceleration extends Component {
	@state() private value = 0
	@state() private repetition = 0

	private static stepFor(repetition: number) {
		return repetition < 15 ? 1 : repetition < 35 ? 10 : 100
	}

	static override get styles() { return stepperStyles }

	private step(direction: number, repetition: number) {
		this.repetition = repetition
		this.value += direction * StoryRepeatAcceleration.stepFor(repetition)
	}

	protected override get template() {
		return html`
			<div class='panel'>
				<h4>accelerating</h4>
				<div class='stepper'>
					<story-repeat-button repeat @trigger=${(e: CustomEvent<number>) => this.step(-1, e.detail)}>−</story-repeat-button>
					<div class='value'>${this.value}</div>
					<story-repeat-button repeat @trigger=${(e: CustomEvent<number>) => this.step(1, e.detail)}>+</story-repeat-button>
				</div>
				<div class='readout'>
					repetition ${this.repetition} · step ${StoryRepeatAcceleration.stepFor(this.repetition)}
				</div>
			</div>
			<p class='hint'>
				Keep holding. The step widens from <code>1</code> to <code>10</code> to <code>100</code> as
				the repetition count climbs — the policy lives in the consumer.
			</p>
		`
	}
}

StoryRepeatAcceleration

export const Acceleration: StoryObj = {
	render: () => html`<story-repeat-acceleration></story-repeat-acceleration>`
}

/** `stop()` ends the repetition without ending the press. */
@component('story-repeat-bounded')
class StoryRepeatBounded extends Component {
	private static readonly max = 10

	@state() private value = 0
	@state() private stopped = false

	static override get styles() { return stepperStyles }

	private step(button: StoryRepeatButton, direction: number) {
		this.value = Math.min(StoryRepeatBounded.max, Math.max(0, this.value + direction))
		if (this.value === 0 || this.value === StoryRepeatBounded.max) {
			button.repeatController.stop()
			this.stopped = true
		}
	}

	protected override get template() {
		const button = (direction: number, label: string) => html`
			<story-repeat-button repeat
				@pointerdown=${() => this.stopped = false}
				@trigger=${(e: Event) => this.step(e.currentTarget as StoryRepeatButton, direction)}
			>${label}</story-repeat-button>
		`
		return html`
			<div class='panel'>
				<h4>bounded 0 – ${StoryRepeatBounded.max}</h4>
				<div class='stepper'>
					${button(-1, '−')}
					<div class='value'>${this.value}</div>
					${button(1, '+')}
				</div>
				<div class='readout'>${this.stopped ? 'stopped at the bound — still pressed' : 'repeating freely'}</div>
			</div>
			<p class='hint'>
				Hold <b>+</b> past ${StoryRepeatBounded.max}. The repetition ends at the bound while the
				press is still down, so nothing keeps firing into a clamp.
			</p>
		`
	}
}

StoryRepeatBounded

export const StoppingAtABound: StoryObj = {
	render: () => html`<story-repeat-bounded></story-repeat-bounded>`
}

/** Both timings are options, so a coarse control can be deliberate and a fine one brisk. */
@component('story-repeat-timing')
class StoryRepeatTiming extends Component {
	@state() private values = [0, 0, 0]

	private static readonly variants = [
		{ label: 'default', delay: 500, interval: 50 },
		{ label: 'deliberate', delay: 1000, interval: 250 },
		{ label: 'brisk', delay: 250, interval: 16 },
	]

	static override get styles() { return stepperStyles }

	protected override get template() {
		return html`
			${StoryRepeatTiming.variants.map((variant, index) => html`
				<div class='panel'>
					<h4>${variant.label}</h4>
					<div class='stepper'>
						<story-repeat-button repeat delay=${variant.delay} interval=${variant.interval}
							@trigger=${() => this.values = this.values.map((v, i) => i === index ? v + 1 : v)}
						>+</story-repeat-button>
						<div class='value'>${this.values[index]}</div>
					</div>
					<div class='readout'>${variant.delay}ms then every ${variant.interval}ms</div>
				</div>
			`)}
		`
	}
}

StoryRepeatTiming

export const Timing: StoryObj = {
	render: () => html`<story-repeat-timing></story-repeat-timing>`
}