import { component, html, ifDefined } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters, getContentTemplate as getContentTemplate } from './BaseDialogParameters.js'

@component('mo-dialog-alert')
export class DialogAlert extends DialogComponent<BaseDialogParameters> {
	protected override get template() {
		const { heading, primaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog style='--mo-dialog-default-foreground-content-color: var(--mo-color-foreground-transparent)'
				heading=${heading}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				?blocking=${blocking}
				size=${ifDefined(size)}
				primaryOnEnter
			>
				${getContentTemplate(content)}
			</mo-dialog>
		`
	}

	protected override primaryAction() { }
}