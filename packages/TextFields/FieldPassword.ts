import { html, component, property, css } from '@a11d/lit'
import { FieldText, type FieldTextAutoComplete } from './FieldText.js'
import { Localizer } from '@3mo/localization'
import '@3mo/icon-button'

Localizer.register('de', {
	Reveal: 'Anzeigen',
	Hide: 'Verbergen'
})

/**
 * @element mo-field-password
 *
 * @attr reveal
 * @attr autoComplete
 */
@component('mo-field-password')
export class FieldPassword extends FieldText {
	@property({ type: Boolean }) reveal = false

	static override get styles() {
		return css`
			${super.styles}

			[autocomplete=off] + div[data-lastpass-icon-root], [autocomplete=off] + div[data-lastpass-infield] {
				display: none;
			}

			input::-ms-reveal {
				display: none;
			}
		`
	}

	protected override get type() {
		return this.reveal ? 'text' : 'password'
	}

	@property() override autoComplete: FieldTextAutoComplete = 'current-password'

	protected override get lengthTemplate() {
		return html.nothing
	}

	protected override get endSlotTemplate() {
		return html`
			${super.endSlotTemplate}
			<mo-icon-button slot='end'
				title=${t(this.reveal ? 'Hide' : 'Reveal')}
				style='color: var(--mo-color-gray)'
				@click=${() => this.reveal = !this.reveal}
				icon=${this.reveal ? 'visibility_off' : 'visibility'}
			></mo-icon-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-password': FieldText
	}
}