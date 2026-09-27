import { Component, component, css, event, html, state } from '@a11d/lit'
import { SegmentedDisplayController } from '@3mo/segmented-input'

/** One real input drawn as six cells, so a code can arrive whole from a keyboard, a paste or the phone's own suggestion. */
@component('story-code-field')
export class CodeField extends Component {
	@event() readonly change!: EventDispatcher<string>

	@state() private value = ''

	readonly display = new SegmentedDisplayController(this, host => ({
		length: 6,
		label: 'Verification code',
		placeholder: '·',
		get value() { return host.value },
		accept: character => /\d/.test(character) ? character : undefined,
		handleInput: value => host.value = value,
		handleChange: value => host.change.dispatch(value),
	}))

	static override get styles() {
		return css`
			div { position: relative; display: inline-flex; gap: 0.5rem; }
			input {
				position: absolute; inset: 0; inline-size: 100%; block-size: 100%; border: none; outline: none;
				background: transparent; color: transparent; caret-color: transparent; font: inherit; text-align: center; letter-spacing: 1em;
			}
			/* A selection would otherwise repaint the value over the cells, which draw it themselves. */
			input::selection { background: transparent; color: transparent; }
			span {
				box-sizing: border-box; display: flex; align-items: center; justify-content: center; inline-size: 2.5rem; block-size: 3rem;
				border: 1px solid var(--mo-color-gray-transparent, gray); border-radius: 6px; font-size: 1.5rem; font-family: ui-monospace, monospace;
			}
			span[data-placeholder] { color: var(--mo-color-gray-transparent, gray); }
			span[data-active] { border-color: var(--mo-color-accent, dodgerblue); box-shadow: 0 0 0 1px var(--mo-color-accent, dodgerblue); }
		`
	}

	protected override get template() {
		return html`
			<div ${this.display.group.ref()}>
				<input ${this.display.input.ref()}>
				${this.display.segments.map(segment => html`<span ${this.display.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}