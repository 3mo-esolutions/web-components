import { type HTMLTemplateResult, component, html, ifDefined } from '@a11d/lit'
import { type DialogAction, DialogComponent, type DialogErrorHandler } from '@a11d/lit-application'
import { getContentTemplate } from '@3mo/dialog'
import { type StandardDialogParameters } from './StandardDialogParameters.js'

interface Parameters<TResult> extends StandardDialogParameters<GenericDialog<TResult>> {
	readonly secondaryButtonText?: string
	readonly primaryAction?: () => DialogAction<TResult>
	readonly secondaryAction?: () => DialogAction<TResult>
	readonly cancellationAction?: () => DialogAction<TResult>
	readonly errorHandler?: DialogErrorHandler
}

@component('mo-generic-dialog')
export class GenericDialog<TResult = void> extends DialogComponent<Parameters<TResult>, TResult> {
	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, secondaryButtonText, blocking, size, content, errorHandler } = this.parameters
		return html`
			<mo-dialog
				heading=${heading}
				size=${ifDefined(size)}
				primaryButtonText=${primaryButtonText ?? t('OK')}
				secondaryButtonText=${secondaryButtonText ?? t('Cancel')}
				?blocking=${blocking}
				primaryOnEnter
				.errorHandler=${errorHandler}
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