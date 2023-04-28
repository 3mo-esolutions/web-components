import { component, html, ifDefined } from '@a11d/lit'
import { DialogAction, DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters } from './BaseDialogParameters.js'

type Parameters<TResult> = BaseDialogParameters & { readonly secondaryButtonText?: string } & {
	readonly primaryAction?: () => DialogAction<TResult>
	readonly secondaryButtonText?: string
	readonly secondaryAction?: () => DialogAction<TResult>
	readonly cancellationAction?: () => DialogAction<TResult>
}

@component('mo-dialog-default')
export class DialogDefault<TResult = void> extends DialogComponent<Parameters<TResult>, TResult> {
	protected override get template() {
		return html`
			<mo-dialog
				heading=${this.parameters.heading}
				size=${ifDefined(this.parameters.size)}
				primaryButtonText=${this.parameters.primaryButtonText ?? t('OK')}
				secondaryButtonText=${this.parameters.secondaryButtonText ?? t('Cancel')}
				?blocking=${this.parameters.blocking}
				primaryOnEnter
			>
				${this.parameters.content}
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