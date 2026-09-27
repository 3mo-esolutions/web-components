import { Component, component, css, event, html, state } from '@a11d/lit'
import { SegmentedInputController } from '@3mo/segmented-input'
import { segmentsOf } from './pattern.js'

/** A time whose two units wrap at their own limits, which makes them spinbuttons. */
@component('story-stepping-field')
export class SteppingField extends Component {
	private static readonly limits = new Map([['segment-0', 23], ['segment-1', 59]])

	@event() readonly change!: EventDispatcher<string>

	@state() private readonly values = new Map<string, number>()

	private get segments() {
		return segmentsOf('##:##', new Map([...this.values].map(([key, value]) => [key, String(value).padStart(2, '0')])))
	}

	readonly controller = new SegmentedInputController(this, host => ({
		label: 'Time',
		get segments() { return host.segments },
		accept: (segment, typed, character) => {
			if (!/\d/.test(character)) {
				return undefined
			}
			const text = typed + character
			return Number(text) > SteppingField.limits.get(segment.key)! ? character : text
		},
		isComplete: (segment, text) => Number(text) * 10 > SteppingField.limits.get(segment.key)! || text.length >= 2,
		handleSegmentInput: (segment, text) => { text ? host.values.set(segment.key, Number(text)) : host.values.delete(segment.key) },
		handleStep: (segment, step) => {
			const max = SteppingField.limits.get(segment.key)!
			const current = host.values.get(segment.key) ?? 0
			const page = segment.key === 'segment-1' ? 15 : 2
			const delta = { increment: 1, decrement: -1, incrementPage: page, decrementPage: -page, min: 0, max: 0 }[step]
			const next = step === 'min' ? 0 : step === 'max' ? max : (((current + delta) % (max + 1)) + max + 1) % (max + 1)
			host.values.set(segment.key, next)
		},
		handleCommit: () => host.change.dispatch(host.values.size === 0 ? '' : host.segments.map(segment => segment.text).join('')),
	}))

	static override get styles() {
		return css`
			div {
				display: inline; white-space: nowrap; padding: 0.25rem 0.5rem; cursor: text;
				font-family: ui-monospace, monospace; font-size: 1.25rem; line-height: 2rem;
				border-bottom: 1px solid var(--mo-color-gray-transparent, gray);
			}
			span { display: inline; border-radius: 2px; padding-inline: 1px; outline: none; caret-color: transparent; user-select: none; }
			span[data-placeholder] { color: var(--mo-color-gray, gray); }
			span[role]:focus { background: var(--mo-color-accent-transparent, rgba(0, 120, 255, 0.2)); }
		`
	}

	protected override get template() {
		return html`
			<div ${this.controller.group.ref()}>
				${this.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}