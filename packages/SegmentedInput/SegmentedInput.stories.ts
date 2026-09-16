import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, property, state } from '@a11d/lit'
import p from './package.json'
import { SegmentedInputController } from './SegmentedInputController.js'
import { SegmentedDisplayController } from './SegmentedDisplayController.js'
import { type EditableSegment, type InputSegment } from './InputSegment.js'

export default {
	title: 'Utilities / Segmented Input',
	package: p,
} as Meta

/**
 * The stories describe their units with a pattern: `#` takes a digit, `A` a letter, anything else
 * separates, and a run of one token is one unit. The entered texts are kept by the host under the
 * unit's key.
 */
const segmentsOf = (pattern: string, texts: ReadonlyMap<string, string>) => {
	let units = 0
	let literals = 0
	return (pattern.match(/(.)\1*/g) ?? []).map((run): InputSegment => {
		if (run[0] !== '#' && run[0] !== 'A') {
			return { key: `literal-${literals++}`, editable: false, text: run }
		}
		const key = `segment-${units++}`
		const text = texts.get(key) ?? ''
		return { key, editable: true, text: text || run, filled: !!text, capacity: run.length, inputMode: run[0] === '#' ? 'numeric' : undefined }
	})
}

const takes = (segment: EditableSegment, character: string) => (segment.inputMode === 'numeric' ? /\d/ : /\p{L}/u).test(character)

/** The line under every story which shows what the field holds. */
const valueStyles = css`
	.value {
		font-family: ui-monospace, monospace;
		color: var(--mo-color-gray, gray);
		margin-block-start: 0.75rem;
	}
`

/** Shared by every story: the group is one line of text, so that a right-to-left value reads as it should. */
const groupStyles = css`
	.group {
		display: inline;
		white-space: nowrap;
		font-family: ui-monospace, monospace;
		font-size: 1.25rem;
		line-height: 2rem;
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid var(--mo-color-gray-transparent, gray);
		cursor: text;
	}

	.group > * {
		display: inline;
		border-radius: 2px;
		padding-inline: 1px;
		outline: none;
		caret-color: transparent;
		user-select: none;
	}

	.group > [data-placeholder] {
		color: var(--mo-color-gray, gray);
	}

	.group > [role]:focus {
		background: var(--mo-color-accent-transparent, rgba(0, 120, 255, 0.2));
	}
`

/**
 * A field of a fixed pattern. Everything the interaction needs comes from the segments — how many
 * units, how wide each is, and what each may hold.
 */
@component('story-template-field')
class TemplateFieldStory extends Component {
	@property() pattern = '#### #### #### ####'
	@property() label = 'Card number'
	@property() override dir: 'ltr' | 'rtl' = 'ltr'
	@property({ type: Boolean }) uppercase = false

	@state() private readonly texts = new Map<string, string>()
	@state() private committed = ''

	private get segments() {
		return segmentsOf(this.pattern, this.texts)
	}

	readonly controller = new SegmentedInputController(this, host => ({
		get segments() { return host.segments },
		get direction() { return host.dir },
		get label() { return host.label },
		accept: (segment, typed, character) => takes(segment, character) ? typed + (host.uppercase ? character.toLocaleUpperCase() : character) : undefined,
		handleSegmentInput: (segment, text) => { text ? host.texts.set(segment.key, text) : host.texts.delete(segment.key) },
		handleCommit: () => host.committed = host.texts.size === 0 ? '' : host.segments.map(segment => segment.text).join(''),
	}))

	static override get styles() {
		return css`${groupStyles}${valueStyles}`
	}

	protected override get template() {
		return html`
			<div class='group' ${this.controller.group.ref()}>
				${this.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
			<div class='value'>Committed: ${this.committed || '—'}</div>
		`
	}
}

TemplateFieldStory

/** Stepping: the two units of a time wrap at their own limits, and page keys move by a quarter of an hour. */
@component('story-stepping-field')
class SteppingFieldStory extends Component {
	private static readonly limits = new Map([['segment-0', 23], ['segment-1', 59]])

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
			return Number(text) > SteppingFieldStory.limits.get(segment.key)! ? character : text
		},
		isComplete: (segment, text) => Number(text) * 10 > SteppingFieldStory.limits.get(segment.key)! || text.length >= 2,
		handleSegmentInput: (segment, text) => { text ? host.values.set(segment.key, Number(text)) : host.values.delete(segment.key) },
		handleStep: (segment, step) => {
			const max = SteppingFieldStory.limits.get(segment.key)!
			const current = host.values.get(segment.key) ?? 0
			const page = segment.key === 'segment-1' ? 15 : 2
			const delta = { increment: 1, decrement: -1, incrementPage: page, decrementPage: -page, min: 0, max: 0 }[step]
			const next = step === 'min' ? 0 : step === 'max' ? max : (((current + delta) % (max + 1)) + max + 1) % (max + 1)
			host.values.set(segment.key, next)
		},
	}))

	static override get styles() {
		return css`${groupStyles}${valueStyles}`
	}

	protected override get template() {
		return html`
			<div class='group' ${this.controller.group.ref()}>
				${this.segments.map(segment => html`<span ${this.controller.segment.ref(segment)}></span>`)}
			</div>
			<div class='value'>Arrow keys step, Page keys jump, Home and End reach the limits.</div>
		`
	}
}

SteppingFieldStory

/** One real input drawn as cells — the anatomy a code needs, so that a phone can fill it in one go. */
@component('story-display-field')
class DisplayFieldStory extends Component {
	@state() private value = ''

	readonly display = new SegmentedDisplayController(this, host => ({
		length: 6,
		label: 'Verification code',
		placeholder: '·',
		get value() { return host.value },
		accept: character => /\d/.test(character) ? character : undefined,
		handleInput: value => host.value = value,
	}))

	static override get styles() {
		return css`
			${valueStyles}

			.group {
				position: relative;
				display: inline-flex;
				gap: 0.5rem;
			}

			input {
				position: absolute;
				inset: 0;
				width: 100%;
				height: 100%;
				border: none;
				outline: none;
				background: transparent;
				color: transparent;
				caret-color: transparent;
				font: inherit;
				text-align: center;
				letter-spacing: 1em;
			}

			/* A selection would otherwise repaint the value over the cells, which draw it themselves. */
			input::selection {
				background: transparent;
				color: transparent;
			}

			span {
				box-sizing: border-box;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 2.5rem;
				height: 3rem;
				border: 1px solid var(--mo-color-gray-transparent, gray);
				border-radius: 6px;
				font-size: 1.5rem;
				font-family: ui-monospace, monospace;
			}

			span[data-placeholder] {
				color: var(--mo-color-gray-transparent, gray);
			}

			span[data-active] {
				border-color: var(--mo-color-accent, dodgerblue);
				box-shadow: 0 0 0 1px var(--mo-color-accent, dodgerblue);
			}
		`
	}

	protected override get template() {
		return html`
			<div class='group' ${this.display.group.ref()}>
				<input ${this.display.input.ref()}>
				${this.display.segments.map(segment => html`<span ${this.display.segment.ref(segment)}></span>`)}
			</div>
			<div class='value'>Value: ${this.value || '—'}</div>
		`
	}
}

DisplayFieldStory

/**
 * The controller and a few segments are all a field needs: type digits and the focus moves on by
 * itself, arrow keys walk the units, backspace empties one and steps back, and the separators stay inert.
 */
export const BuildYourOwn: StoryObj = {
	render: () => html`<story-template-field pattern='##/####' label='Expiry'></story-template-field>`
}

/** The segments decide everything: how many units there are, how wide they are, and what they take. */
export const Templates: StoryObj = {
	render: () => html`
		<mo-flex gap='2rem'>
			<story-template-field pattern='#### #### #### ####' label='Card number'></story-template-field>
			<story-template-field pattern='###.###.###.###' label='IP address'></story-template-field>
			<story-template-field pattern='AAAA-AAAA-AAAA' label='License key' uppercase></story-template-field>
			<story-template-field pattern='##/##' label='Expiry'></story-template-field>
		</mo-flex>
	`
}

/**
 * A right-to-left group keeps the order the language reads it in, because the segments are text rather
 * than boxes: the numbers within a unit still run left to right.
 */
export const RightToLeft: StoryObj = {
	render: () => html`<story-template-field dir='rtl' pattern='####/##/##' label='تاریخ'></story-template-field>`
}

/** A unit which knows its limits can be stepped through as a spinbutton. */
export const Stepping: StoryObj = {
	render: () => html`<story-stepping-field></story-stepping-field>`
}

/** One input, six cells: the code arrives whole, from a keyboard, a paste or the phone's own suggestion. */
export const Code: StoryObj = {
	render: () => html`<story-display-field></story-display-field>`
}