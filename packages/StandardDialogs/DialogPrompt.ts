import { state, component, html, ifDefined, query, style } from '@a11d/lit'
import { FieldText, FieldTextArea } from '@3mo/field'
import { DialogComponent } from '@a11d/lit-application'
import { Localizer, LanguageCode } from '@3mo/localization'
import { BaseDialogParameters } from './BaseDialogParameters.js'

Localizer.register(LanguageCode.German, {
	'OK': 'OK',
	'Cancel': 'Abbrechen',
	'Apply': 'Übernehmen',
	'Input': 'Eingabe'
})

Localizer.register(LanguageCode.Farsi, {
	'OK': 'تایید',
	'Cancel': 'لغو',
	'Apply': 'اعمال',
	'Input': 'ورودی'
})

type Parameters = BaseDialogParameters & {
	readonly inputLabel?: string
	readonly value?: string
	readonly isTextArea?: boolean
}

@component('mo-dialog-prompt')
export class DialogPrompt extends DialogComponent<Parameters, string> {
	@state() private value = this.parameters.value ?? ''

	@query('#inputElement') readonly inputElement!: FieldText | FieldTextArea

	protected override get template() {
		return html`
			<mo-dialog
				heading=${this.parameters.heading}
				primaryButtonText=${this.parameters.primaryButtonText ?? t('Apply')}
				?blocking=${this.parameters.blocking}
				size=${ifDefined(this.parameters.size)}
				primaryOnEnter
			>
				<mo-flex ${style({ width: '100%', height: '100%' })} gap='6px'>
					${this.parameters.content}
					${this.textFieldTemplate}
				</mo-flex>
			</mo-dialog>
		`
	}

	private get textFieldTemplate() {
		return this.parameters.isTextArea ? html`
			<mo-field-text-area id='inputElement' data-focus
				label=${this.parameters.inputLabel ?? t('Input')}
				value=${this.value}
				@input=${(e: CustomEvent<string>) => this.value = e.detail}
			></mo-field-text-area>
		` : html`
			<mo-field-text id='inputElement' data-focus
				label=${this.parameters.inputLabel ?? t('Input')}
				value=${this.value}
				@input=${(e: CustomEvent<string>) => this.value = e.detail}
			></mo-field-text>
		`
	}

	protected override primaryAction = () => this.value
}