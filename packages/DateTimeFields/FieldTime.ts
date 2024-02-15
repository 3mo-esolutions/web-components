import { component, html, style } from '@a11d/lit'
import { FieldText } from '@3mo/text-fields'

// TODO: Migrate to Temporal.PlainTime

@component('mo-field-time')
export class FieldTime extends FieldText {
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