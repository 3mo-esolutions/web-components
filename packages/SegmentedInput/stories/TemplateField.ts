import { Component, component, css, event, html, property, state } from '@a11d/lit'
import { SegmentedInputController } from '@3mo/segmented-input'
import { segmentsOf, takes } from './pattern.js'

/** A field of a fixed pattern: the segments alone decide how many units there are, how wide each is and what each takes. */
@component('story-template-field')
export class TemplateField extends Component {
	@event() readonly change!: EventDispatcher<string>

	@property() pattern = '#### #### #### ####'
	@property() label = 'Card number'
	@property() override dir: 'ltr' | 'rtl' = 'ltr'
	@property({ type: Boolean }) uppercase = false

	@state() private readonly texts = new Map<string, string>()

	private get segments() {
		return segmentsOf(this.pattern, this.texts)
	}

	readonly controller = new SegmentedInputController(this, host => ({
		get segments() { return host.segments },
		get direction() { return host.dir },
		get label() { return host.label },
		accept: (segment, typed, character) => takes(segment, character) ? typed + (host.uppercase ? character.toLocaleUpperCase() : character) : undefined,
		handleSegmentInput: (segment, text) => { text ? host.texts.set(segment.key, text) : host.texts.delete(segment.key) },
		handleCommit: () => host.change.dispatch(host.texts.size === 0 ? '' : host.segments.map(segment => segment.text).join('')),
	}))

	static override get styles() {
		return css`
			/* One line of text rather than a row of boxes, so that a right-to-left value reads as it should. */
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
