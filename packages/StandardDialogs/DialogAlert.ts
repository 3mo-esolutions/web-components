import { HTMLTemplateResult, component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters, getContentTemplate as getContentTemplate } from '@3mo/dialog'

@component('mo-dialog-alert')
export class DialogAlert extends DialogComponent<BaseDialogParameters<DialogAlert>> {
	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog style='--mo-dialog-content-color: color-mix(in srgb, currentColor, transparent 16%)'
				heading=${heading}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				?blocking=${blocking}
				size=${ifDefined(size)}
				primaryOnEnter
				errorHandler='no-op'
			>
				${getContentTemplate(this, content)}
			</mo-dialog>
		`
	}

	protected override primaryAction() { }
}