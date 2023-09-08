import { component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters } from './BaseDialogParameters.js'

@component('mo-dialog-alert')
export class DialogAlert extends DialogComponent<BaseDialogParameters> {
	protected override get template() {
		return html`
			<mo-dialog style='--mo-dialog-default-foreground-content-color: var(--mo-color-foreground-transparent)'
				heading=${this.parameters.heading}
				primaryButtonText=${this.parameters.primaryButtonText ?? t('OK')}
				?blocking=${this.parameters.blocking}
				size=${ifDefined(this.parameters.size)}
				primaryOnEnter
			>
				${this.parameters.content}
			</mo-dialog>
		`
	}

	protected override primaryAction() { }
}