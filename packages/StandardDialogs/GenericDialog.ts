import { component, html, ifDefined } from '@a11d/lit'
import { DialogAction, DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters, getContentTemplate } from './BaseDialogParameters.js'

type Parameters<TResult> = BaseDialogParameters & { readonly secondaryButtonText?: string } & {
	readonly primaryAction?: () => DialogAction<TResult>
	readonly secondaryButtonText?: string
	readonly secondaryAction?: () => DialogAction<TResult>
	readonly cancellationAction?: () => DialogAction<TResult>
}

@component('mo-generic-dialog')
export class GenericDialog<TResult = void> extends DialogComponent<Parameters<TResult>, TResult> {
	protected override get template() {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog
				heading=${heading}
				size=${ifDefined(size)}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				secondaryButtonText=${secondaryButtonText ?? t('Cancel')}
				?blocking=${blocking}
				primaryOnEnter
			>
				${getContentTemplate(content)}
			</mo-dialog>
		`
	}

	protected override primaryAction() {
		return this.parameters.primaryAction ? this.parameters.primaryAction() : super.primaryAction()
	}

	protected override secondaryAction() {
		return this.parameters.secondaryAction ? this.parameters.secondaryAction() : super.secondaryAction()
	}

	protected override cancellationAction() {
		return this.parameters.cancellationAction ? this.parameters.cancellationAction() : super.cancellationAction()
	}
}