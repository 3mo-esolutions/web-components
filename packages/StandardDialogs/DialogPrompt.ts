import { state, component, html, ifDefined, query, style, HTMLTemplateResult } from '@a11d/lit'
import { FieldText, FieldTextArea } from '@3mo/text-fields'
import { DialogComponent } from '@a11d/lit-application'
import { Localizer } from '@3mo/localization'
import { BaseDialogParameters, getContentTemplate } from '@3mo/dialog'

Localizer.register('de', {
	'OK': 'OK',
	'Cancel': 'Abbrechen',
	'Apply': 'Übernehmen',
	'Input': 'Eingabe'
})

Localizer.register('fa', {
	'OK': 'تایید',
	'Cancel': 'لغو',
	'Apply': 'اعمال',
	'Input': 'ورودی'
})

interface Parameters extends BaseDialogParameters<DialogPrompt> {
	readonly inputLabel?: string
	readonly value?: string
	readonly isTextArea?: boolean
}

@component('mo-dialog-prompt')
export class DialogPrompt extends DialogComponent<Parameters, string> {
	@state() private value = this.parameters.value ?? ''

	@query('#inputElement') readonly inputElement!: FieldText | FieldTextArea

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog style='--mo-dialog-content-color: color-mix(in srgb, currentColor, transparent 16%)'
				heading=${heading}
				primaryButtonText=${primaryButtonText ?? t('Apply')}
				?blocking=${blocking}
				size=${ifDefined(size)}
				primaryOnEnter
				errorHandler='no-op'
			>
				<mo-flex ${style({ width: '100%', height: '100%' })} gap='6px'>
					${getContentTemplate(this, content)}
					${this.textFieldTemplate}
				</mo-flex>
			</mo-dialog>
		`
	}

	private get textFieldTemplate() {
		return this.parameters.isTextArea ? html`
			<mo-field-text-area id='inputElement' autofocus
				label=${this.parameters.inputLabel ?? t('Input')}
				value=${this.value}
				@input=${(e: CustomEvent<string>) => this.value = e.detail}
			></mo-field-text-area>
		` : html`
			<mo-field-text id='inputElement' autofocus
				label=${this.parameters.inputLabel ?? t('Input')}
				value=${this.value}
				@input=${(e: CustomEvent<string>) => this.value = e.detail}
			></mo-field-text>
		`
	}

	protected override primaryAction = () => this.value
}