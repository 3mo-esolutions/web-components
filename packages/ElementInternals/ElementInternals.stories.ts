import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, eventListener, html, property, query, state, type HTMLTemplateResult } from '@a11d/lit'
import p from './package.json'
import { FormAssociationController } from './FormAssociationController.js'
import { formAssociated } from './formAssociated.js'

export default {
	title: 'Utilities / Element Internals',
	package: p,
} as Meta

const controlStyles = css`
	:host { display: block; }

	label { display: flex; flex-direction: column; gap: 0.35rem; font-size: small; }

	b { color: var(--mo-color-red); }

	input {
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--mo-color-transparent-gray-3);
		border-radius: var(--mo-border-radius);
		background: transparent;
		color: var(--mo-color-foreground);
		font: inherit;
	}

	input:disabled { opacity: 0.4; }

	:host([reported]) input { border-color: var(--mo-color-red); }
`

/** A text control which takes part in forms - it submits, validates, resets and follows fieldsets. */
@component('story-internals-field')
@formAssociated
class StoryField extends Component {
	@property() label = ''
	@property() value = ''
	@property({ type: Boolean }) required = false
	/** `:user-invalid` never matches a form-associated custom element, so the control keeps the flag itself. */
	@property({ type: Boolean, reflect: true }) reported = false

	@state() private disabledByForm = false

	@query('input') readonly inputElement?: HTMLInputElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.value },
		get validity() { return host.inputElement ?? undefined },
		// A native control resets to its attribute, not to whatever was last typed into it.
		handleReset: () => {
			host.value = host.getAttribute('value') ?? ''
			host.reported = false
		},
		handleDisabledChange: disabled => host.disabledByForm = disabled,
	}))

	@eventListener('invalid')
	protected handleInvalid() {
		this.reported = true
	}

	static override get styles() { return controlStyles }

	protected override get template() {
		return html`
			<label>
				<span>${this.label}${!this.required ? html.nothing : html`<b>*</b>`}</span>
				<input
					.value=${this.value}
					?required=${this.required}
					?disabled=${this.disabledByForm}
					@input=${(e: Event) => this.value = (e.target as HTMLInputElement).value}
				>
			</label>
		`
	}
}

StoryField

/** The same control without the declaration - the platform never sees the input in its shadow root. */
@component('story-internals-plain-field')
class StoryPlainField extends Component {
	@property() label = ''
	@property() value = ''

	static override get styles() { return controlStyles }

	protected override get template() {
		return html`
			<label>
				<span>${this.label}</span>
				<input .value=${this.value} @input=${(e: Event) => this.value = (e.target as HTMLInputElement).value}>
			</label>
		`
	}
}

StoryPlainField

/** A control with nothing to read a validity off, so it works one out and names what to point at. */
@component('story-internals-rating')
@formAssociated
class StoryRating extends Component {
	@property({ type: Number }) value?: number
	@property({ type: Boolean }) required = false
	@property({ type: Boolean, reflect: true }) reported = false

	@query('button') readonly firstStar?: HTMLButtonElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.value?.toString() },
		get validity() {
			return {
				validity: { valueMissing: host.required && host.value === undefined },
				validationMessage: 'Pick a rating before sending this off.',
			}
		},
		get anchor() { return host.firstStar ?? undefined },
		handleReset: () => {
			host.value = undefined
			host.reported = false
		},
	}))

	@eventListener('invalid')
	protected handleInvalid() {
		this.reported = true
	}

	static override get styles() {
		return css`
			:host { display: flex; flex-direction: column; gap: 0.35rem; font-size: small; }

			.stars { display: flex; gap: 0.15rem; }

			button {
				border: none;
				background: none;
				padding: 0.1rem;
				font-size: 1.5rem;
				line-height: 1;
				cursor: pointer;
				color: var(--mo-color-transparent-gray-3);
			}

			button[data-active] { color: var(--mo-color-accent); }

			:host([reported]) .stars { outline: 1px solid var(--mo-color-red); border-radius: var(--mo-border-radius); }
		`
	}

	protected override get template() {
		return html`
			<span>Rating${!this.required ? html.nothing : html`<b>*</b>`}</span>
			<div class='stars'>
				${[1, 2, 3, 4, 5].map(star => html`
					<button type='button' ?data-active=${!!this.value && star <= this.value} @click=${() => this.value = star}>★</button>
				`)}
			</div>
		`
	}
}

StoryRating

const formStyles = css`
	:host { display: flex; gap: 2.5rem; flex-wrap: wrap; align-items: flex-start; }

	form { display: flex; flex-direction: column; gap: 1rem; min-inline-size: 18rem; }

	fieldset { border: 1px dashed var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius); display: flex; flex-direction: column; gap: 1rem; }

	legend { font-size: small; color: var(--mo-color-gray); }

	.actions { display: flex; gap: 0.5rem; }

	.native { display: flex; flex-direction: column; gap: 0.35rem; font-size: small; }

	.native input {
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--mo-color-transparent-gray-3);
		border-radius: var(--mo-border-radius);
		background: transparent;
		color: var(--mo-color-foreground);
		font: inherit;
	}

	button {
		padding: 0.45rem 0.9rem;
		border: 1px solid var(--mo-color-transparent-gray-3);
		border-radius: var(--mo-border-radius);
		background: var(--mo-color-transparent-gray-3);
		color: var(--mo-color-foreground);
		font: inherit;
		cursor: pointer;
	}

	.readout { display: flex; flex-direction: column; gap: 0.75rem; min-inline-size: 20rem; }

	h4 { margin: 0; color: var(--mo-color-gray); font-size: small; text-transform: uppercase; letter-spacing: 0.05em; }

	table { border-collapse: collapse; font-size: small; }

	td { padding: 0.2rem 0.75rem 0.2rem 0; font-variant-numeric: tabular-nums; }

	td:first-child { color: var(--mo-color-gray); }

	.hint { color: var(--mo-color-gray); font-size: small; line-height: 1.6; max-inline-size: 30rem; }

	code { color: var(--mo-color-accent); }

	.empty { color: var(--mo-color-gray); font-size: small; font-style: italic; }
`

/** Renders a form and whatever the platform can currently see of it. */
abstract class StoryFormComponent extends Component {
	@query('form') protected readonly formElement!: HTMLFormElement

	@state() protected entries = new Array<[string, FormDataEntryValue]>()
	@state() protected submission?: string

	protected abstract get controlsTemplate(): HTMLTemplateResult

	protected get actionsTemplate() {
		return html`
			<div class='actions'>
				<button type='submit'>Submit</button>
				<button type='reset'>Reset</button>
			</div>
		`
	}

	protected abstract get hintTemplate(): HTMLTemplateResult

	static override get styles() { return formStyles }

	protected override updated() {
		this.read()
	}

	protected read() {
		const entries = [...new FormData(this.formElement)]
		if (JSON.stringify(entries) !== JSON.stringify(this.entries)) {
			this.entries = entries
		}
	}

	protected override get template() {
		return html`
			<form
				@input=${() => this.read()}
				@change=${() => this.read()}
				@reset=${() => setTimeout(() => this.read())}
				@submit=${(e: SubmitEvent) => this.handleSubmit(e)}
			>
				${this.controlsTemplate}
				${this.actionsTemplate}
			</form>

			<div class='readout'>
				<div>
					<h4>What the form submits</h4>
					${this.entries.length > 0 ? html`
						<table>${this.entries.map(([name, value]) => html`<tr>
								<td>${name}</td>
								<td>${value === '' ? '(empty)' : value}</td>
							</tr>`)}</table>
					` : html`<div class='empty'>nothing at all</div>`}
				</div>
				${this.readoutTemplate}
				${!this.submission ? html.nothing : html`<div>
						<h4>Last submission</h4>
						<div>${this.submission}</div>
					</div>`}
			</div>

			<p class='hint'>${this.hintTemplate}</p>
		`
	}

	protected get readoutTemplate() {
		return html``
	}

	private handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		this.submission = new URLSearchParams([...new FormData(this.formElement)] as Array<[string, string]>).toString()
	}
}

@component('story-internals-participation')
class StoryParticipation extends StoryFormComponent {
	protected override get controlsTemplate() {
		return html`
			<label class='native'>
				<span>Native input</span>
				<input name='native' value='typed'>
			</label>
			<story-internals-plain-field name='plain' label='Wrapper without the declaration' value='typed'></story-internals-plain-field>
			<story-internals-field name='associated' label='Wrapper with it' value='typed'></story-internals-field>
		`
	}

	protected override get hintTemplate() {
		return html`
			All three hold the same text, and one of them is missing from the submission. A control's
			shadow root is not the form's tree, so the <code>&lt;input&gt;</code> inside the middle
			wrapper is invisible to it - only an element which declares itself
			<code>formAssociated</code> can hand a value over. Type in each to watch the table follow.
		`
	}
}

StoryParticipation

export const FormParticipation: StoryObj = {
	render: () => html`<story-internals-participation></story-internals-participation>`
}

@component('story-internals-validation')
class StoryValidation extends StoryFormComponent {
	@query('story-internals-field') private readonly field!: StoryField
	@query('story-internals-rating') private readonly rating!: StoryRating

	// Reading validity rather than calling checkValidity(), which would fire an invalid event at the
	// controls on every render and have them mark themselves reported before anyone submitted anything.
	private get blocked() {
		return [this.field, this.rating].some(control => control?.formAssociation.validity.valid === false)
	}

	protected override get controlsTemplate() {
		return html`
			<story-internals-field name='email' label='Email' required></story-internals-field>
			<story-internals-rating name='rating' required></story-internals-rating>
		`
	}

	protected override get readoutTemplate() {
		return html`
			<div>
				<h4>What the platform makes of it</h4>
				<table>
					<tr>
						<td>the form</td>
						<td>${this.blocked ? 'refuses to submit' : 'would submit'}</td>
					</tr>
					<tr>
						<td>email</td>
						<td>${this.field?.formAssociation.validationMessage || 'valid'}</td>
					</tr>
					<tr>
						<td>rating</td>
						<td>${this.rating?.formAssociation.validationMessage || 'valid'}</td>
					</tr>
				</table>
			</div>
		`
	}

	protected override get hintTemplate() {
		return html`
			Submit while empty: the form refuses, focus lands on the offending control and the browser
			shows its own message beside it - the email's comes from the <code>&lt;input&gt;</code> it
			reads its validity off, the rating's from the state it works out itself. Fix the email and
			submit again to watch the platform move on to the rating.
			<br><br>
			They only turn red once the platform has actually complained about them, and they have to
			arrange that themselves: <code>:user-invalid</code> never matches a form-associated custom
			element, because nothing in <code>ElementInternals</code> can tell the platform that the
			user has had a go at it. Each control listens for its own <code>invalid</code> event
			instead.
		`
	}
}

StoryValidation

export const ConstraintValidation: StoryObj = {
	render: () => html`<story-internals-validation></story-internals-validation>`
}

@component('story-internals-lifecycle')
class StoryLifecycle extends StoryFormComponent {
	@state() private disabled = false

	protected override get controlsTemplate() {
		return html`
			<story-internals-field name='name' label='Name' value='Ada'></story-internals-field>
			<fieldset ?disabled=${this.disabled}>
				<legend>Billing</legend>
				<story-internals-field name='city' label='City' value='Cambridge'></story-internals-field>
				<story-internals-rating name='stars'></story-internals-rating>
			</fieldset>
		`
	}

	protected override get actionsTemplate() {
		return html`
			<div class='actions'>
				${super.actionsTemplate}
				<button type='button' @click=${() => this.disabled = !this.disabled}>
					${this.disabled ? 'Enable' : 'Disable'} the fieldset
				</button>
			</div>
		`
	}

	protected override get hintTemplate() {
		return html`
			Type over both fields and press <b>Reset</b>: each returns to its <code>value</code>
			attribute, the way a native control does, because the form hands the reset to the control
			and the control decides what its default is. Disabling the fieldset takes everything inside
			it out of the submission and out of validation, and greys the inputs out - the form says so
			and the controls listen.
		`
	}
}

StoryLifecycle

export const ResetAndFieldsets: StoryObj = {
	render: () => html`<story-internals-lifecycle></story-internals-lifecycle>`
}