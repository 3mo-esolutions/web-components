import { type HTMLTemplateResult, component, css, html } from '@a11d/lit'
import { DialogActionKey, DialogComponent } from '@a11d/lit-application'
import { getContentTemplate, type DialogContent } from '@3mo/dialog'

interface Parameters<T> {
	/** Says what is happening, such as "The invoice is being generated…". */
	readonly heading: string
	/** Shown below the progress indicator. */
	readonly content?: DialogContent<DialogProgress<T>>
	/** The task, whose result `confirm()` resolves with. */
	readonly action: (this: DialogProgress<T>) => T | PromiseLike<T>
}

/**
 * A dialog that runs a task as soon as it opens, shows its progress, and closes when the task ends.
 *
 * `confirm()` resolves with the result of the task, or rejects with its error. The dialog is blocking, so nothing but the end of the task closes it.
 *
 * @element mo-dialog-progress
 */
@component('mo-dialog-progress')
export class DialogProgress<T = void> extends DialogComponent<Parameters<T>, T> {
	protected override initialized() {
		this.handleAction(DialogActionKey.Primary)
	}

	static override get styles() {
		return css`
			#content {
				display: grid;
				justify-items: center;
				gap: 16px;
				padding-block: 16px 8px;
				min-width: min(320px, 100%);
				text-align: center;
			}
		`
	}

	protected override get template(): HTMLTemplateResult {
		const { heading, content } = this.parameters
		return html`
			<mo-dialog blocking heading=${heading}>
				<div id='content'>
					${this.indicatorTemplate}
					${getContentTemplate(this, content)}
				</div>
			</mo-dialog>
		`
	}

	/** Shown above the content, a circular progress by default. */
	protected get indicatorTemplate(): HTMLTemplateResult {
		return html`<mo-circular-progress></mo-circular-progress>`
	}

	protected override primaryAction = async () => {
		try {
			return await this.parameters.action.call(this)
		} catch (error) {
			// Returned rather than thrown: closing with an error rejects confirm(), while a throw would leave the blocking dialog open.
			return error instanceof Error ? error : new Error(String(error), { cause: error })
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-dialog-progress': DialogProgress<unknown>
	}
}
