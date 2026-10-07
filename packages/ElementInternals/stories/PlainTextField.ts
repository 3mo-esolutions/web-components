import { Component, component, html, property } from '@a11d/lit'
import { TextField } from './TextField.js'

/** The same text field without `@formAssociated`: the form never sees the input in its shadow root. */
@component('story-form-plain-text-field')
export class PlainTextField extends Component {
	@property() label = ''
	@property() value = ''

	static override get styles() {
		return TextField.styles
	}

	protected override get template() {
		return html`
			<label>
				<span>${this.label}</span>
				<input .value=${this.value} @input=${(event: Event) => this.value = (event.target as HTMLInputElement).value}>
			</label>
		`
	}
}
