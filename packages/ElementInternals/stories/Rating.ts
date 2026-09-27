import { Component, component, css, eventListener, html, property, query } from '@a11d/lit'
import { FormAssociationController, formAssociated } from '@3mo/element-internals'

/** A star rating with no input to read a validity off, so it works one out and names the star to point at. */
@component('story-form-rating')
@formAssociated
export class Rating extends Component {
	@property({ type: Number }) value?: number
	@property({ type: Boolean }) required = false
	@property({ type: Boolean, reflect: true }) reported = false

	@query('button') readonly firstStar?: HTMLButtonElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.value?.toString() },
		get validity() {
			return {
				validity: { valueMissing: host.required && host.value === undefined },
				validationMessage: 'Pick a rating.',
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
			b { color: var(--mo-color-red); }
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
					<button type='button' aria-label='${star} stars' ?data-active=${!!this.value && star <= this.value} @click=${() => this.value = star}>★</button>
				`)}
			</div>
		`
	}
}