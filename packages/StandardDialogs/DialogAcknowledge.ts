import { type HTMLTemplateResult, component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { getContentTemplate } from '@3mo/dialog'
import { type StandardDialogParameters } from './StandardDialogParameters.js'

interface Parameters extends StandardDialogParameters<DialogAcknowledge> {
	readonly secondaryButtonText?: string
}

@component('mo-dialog-acknowledge')
export class DialogAcknowledge extends DialogComponent<Parameters, boolean> {
	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog style='--mo-dialog-content-color: color-mix(in srgb, currentColor, transparent 16%)'
				heading=${heading}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				secondaryButtonText=${secondaryButtonText ?? t('Cancel')}
				?blocking=${blocking}
				size=${ifDefined(size)}
				primaryOnEnter
				errorHandler='no-op'
			>
				${getContentTemplate(this, content)}
			</mo-dialog>
		`
	}
	protected override primaryAction = () => true
	protected override secondaryAction = () => false
	protected override cancellationAction = () => false
}