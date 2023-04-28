import { component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters } from './BaseDialogParameters.js'

type Parameters = BaseDialogParameters & { readonly secondaryButtonText?: string }

@component('mo-dialog-acknowledge')
export class DialogAcknowledge extends DialogComponent<Parameters, boolean> {
	protected override get template() {
		return html`
			<mo-dialog
				heading=${this.parameters.heading}
				primaryButtonText=${this.parameters.primaryButtonText ?? t('OK')}
				secondaryButtonText=${this.parameters.secondaryButtonText ?? t('Cancel')}
				?blocking=${this.parameters.blocking}
				size=${ifDefined(this.parameters.size)}
				primaryOnEnter
			>
				${this.parameters.content}
			</mo-dialog>
		`
	}
	protected override primaryAction = () => true
	protected override secondaryAction = () => false
	protected override cancellationAction = () => false
}