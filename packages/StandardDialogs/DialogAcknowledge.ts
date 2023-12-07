import { HTMLTemplateResult, component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters, getContentTemplate } from '@3mo/dialog'

interface Parameters extends BaseDialogParameters<DialogAcknowledge> {
	readonly secondaryButtonText?: string
}

@component('mo-dialog-acknowledge')
export class DialogAcknowledge extends DialogComponent<Parameters, boolean> {
	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog style='--mo-dialog-default-foreground-content-color: var(--mo-color-foreground-transparent)'
				heading=${heading}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				secondaryButtonText=${secondaryButtonText ?? t('Cancel')}
				?blocking=${blocking}
				size=${ifDefined(size)}
				primaryOnEnter
			>
				${getContentTemplate(this, content)}
			</mo-dialog>
		`
	}
	protected override primaryAction = () => true
	protected override secondaryAction = () => false
	protected override cancellationAction = () => false
}