import { html, component, property, css } from '@a11d/lit'
import { FieldText, type FieldTextAutoComplete } from './FieldText.js'
import { Localizer } from '@3mo/localization'
import '@3mo/icon-button'

Localizer.dictionaries.add('de', {
	Password: 'Passwort',
	Reveal: 'Anzeigen',
	Hide: 'Verbergen',
})

/**
 * @element mo-field-password
 *
 * @attr reveal
 * @attr autoComplete
 *
 * @i18n "Password"
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

	@property() override label = t('Password')
	@property() override autoComplete: FieldTextAutoComplete = 'current-password'

	protected override get lengthTemplate() {
		return html.nothing
	}

	protected override get endSlotTemplate() {
		return html`
			${super.endSlotTemplate}
			<mo-icon-button slot='end'
				title=${this.reveal ? t('Hide') : t('Reveal')}
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