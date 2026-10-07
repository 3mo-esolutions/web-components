import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import textFieldSource from './stories/TextField.ts?raw'
import plainTextFieldSource from './stories/PlainTextField.ts?raw'
import ratingSource from './stories/Rating.ts?raw'
import './stories/TextField.js'
import './stories/PlainTextField.js'
import './stories/Rating.js'

export default {
	title: 'Behaviors / Element Internals',
	decorators: [story => {
		const [submission, setSubmission] = useState<string | undefined>(undefined)
		return html`
			<form style='display: flex; flex-direction: column; gap: 16px; max-width: 320px'
				@submit=${(event: SubmitEvent) => {
					event.preventDefault()
					setSubmission([...new FormData(event.target as HTMLFormElement)].map(([name, value]) => `${name}=${value}`).join('&'))
				}}
			>
				${story()}
				<div style='display: flex; gap: 8px'>
					<button>Submit</button>
					<button type='reset'>Reset</button>
				</div>
			</form>
			${submission === undefined ? html.nothing : html`<p>Submitted <code>${submission || 'nothing'}</code></p>`}
		`
	}],
} satisfies Meta

/** Edit the name and submit: the field hands its value to the form under its `name`. */
export const Default: StoryObj = {
	parameters: sourceOf(textFieldSource),
	render: () => html`
		<story-form-text-field name='name' label='Name' value='Ada'></story-form-text-field>
	`,
}

/** All three hold the same text, yet the field without `@formAssociated` is missing from the submission: its input sits in a shadow root, outside the form's tree. */
export const FormParticipation: StoryObj = {
	parameters: sourceOf(plainTextFieldSource),
	render: () => html`
		<label style='display: flex; flex-direction: column; gap: 0.35rem; font-size: small'>
			Native input
			<input name='native' value='typed'>
		</label>
		<story-form-plain-text-field name='plain' label='Without @formAssociated' value='typed'></story-form-plain-text-field>
		<story-form-text-field name='associated' label='With @formAssociated' value='typed'></story-form-text-field>
	`,
}

/** Submit while empty: the form refuses and the browser shows the message of the first invalid control - the email's from its input, the rating's from the state it works out itself. */
export const ConstraintValidation: StoryObj = {
	parameters: sourceOf(ratingSource),
	render: () => html`
		<story-form-text-field name='email' label='Email' required></story-form-text-field>
		<story-form-rating name='rating' required></story-form-rating>
	`,
}

/** Type over the fields and press Reset: `handleReset` returns each to its `value` attribute, as a native input does. */
export const Reset: StoryObj = {
	parameters: sourceOf(textFieldSource),
	render: () => html`
		<story-form-text-field name='name' label='Name' value='Ada'></story-form-text-field>
		<story-form-text-field name='city' label='City' value='Cambridge'></story-form-text-field>
		<story-form-rating name='stars'></story-form-rating>
	`,
}

/** Untick Billing: the disabled fieldset takes its controls out of the submission and out of validation, and `handleDisabledChange` greys them out. */
export const DisabledFieldset: StoryObj = {
	parameters: sourceOf(textFieldSource),
	render: () => {
		const [billing, setBilling] = useState(true)
		return html`
			<story-form-text-field name='name' label='Name' value='Ada'></story-form-text-field>
			<fieldset ?disabled=${!billing} style='display: flex; flex-direction: column; gap: 16px; border: 1px dashed var(--mo-color-transparent-gray-3); border-radius: var(--mo-border-radius)'>
				<legend>
					<label>
						<input type='checkbox' ?checked=${billing} @change=${(event: Event) => setBilling((event.target as HTMLInputElement).checked)}>
						Billing
					</label>
				</legend>
				<story-form-text-field name='city' label='City' value='Cambridge' required></story-form-text-field>
				<story-form-rating name='stars' required></story-form-rating>
			</fieldset>
		`
	},
}
