import { HTMLTemplateResult, component, html, ifDefined } from '@a11d/lit'
import { DialogAction, DialogComponent } from '@a11d/lit-application'
import { BaseDialogParameters, getContentTemplate } from '@3mo/dialog'

interface Parameters<TResult> extends BaseDialogParameters<GenericDialog<TResult>> {
	readonly secondaryButtonText?: string
	readonly primaryAction?: () => DialogAction<TResult>
	readonly secondaryAction?: () => DialogAction<TResult>
	readonly cancellationAction?: () => DialogAction<TResult>
}

@component('mo-generic-dialog')
export class GenericDialog<TResult = void> extends DialogComponent<Parameters<TResult>, TResult> {
	protected override get template(): HTMLTemplateResult {
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
				${getContentTemplate(this, content)}
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