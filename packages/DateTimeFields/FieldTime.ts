import { component, html, property, style } from '@a11d/lit'
import { Localizer } from '@3mo/localization'
import { FieldText } from '@3mo/text-fields'

Localizer.dictionaries.add('de', {
	'Time': 'Uhrzeit',
})

// TODO: Migrate to Temporal.PlainTime

/**
 * @element mo-field-time
 *
 * @i18n "Time"
 */
@component('mo-field-time')
export class FieldTime extends FieldText {
	@property() override label = t('Time')

	override get inputType() {
		return 'time'
	}

	protected override get startSlotTemplate() {
		return html`
			<mo-icon slot='start' @click=${() => this.focus()} icon='schedule' ${style({ color: 'var(--mo-color-gray)' })}></mo-icon>
			${super.startSlotTemplate}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-time': FieldTime
	}
}