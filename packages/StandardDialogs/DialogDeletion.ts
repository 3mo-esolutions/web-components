import { component, html, css, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { DialogComponent, NotificationComponent } from '@a11d/lit-application'
import { LocalStorage } from '@a11d/local-storage'
import { Localizer } from '@3mo/localization'
import { getContentTemplate, type DialogContent, type DialogSize } from '@3mo/dialog'

Localizer.register('de', {
	'Deletion Confirmation': 'Löschbestätigung',
})

interface Parameters {
	readonly heading?: string
	readonly content?: DialogContent<DialogDeletion>
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
	deletionAction?: (this: DialogDeletion) => void | PromiseLike<void>
}

@component('mo-dialog-deletion')
export class DialogDeletion extends DialogComponent<Parameters> {
	static readonly deletionConfirmation = new LocalStorage('DialogDeletion.DeletionConfirmation', true)

	override async confirm() {
		if (DialogDeletion.deletionConfirmation.value === false) {
			try {
				await this.parameters.deletionAction?.call(this)
				return
			} catch (e: any) {
				NotificationComponent.notifyAndThrowError(e)
			}
		}

		return super.confirm()
	}

	static override get styles() {
		return css`
			mo-dialog {
				--mo-dialog-content-color: color-mix(in srgb, currentColor, transparent 16%);
			}

			mo-loading-button {
				--mo-button-accent-color: var(--mo-color-red);
			}
		`
	}

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog
				heading=${heading ?? t('Deletion Confirmation')}
				size=${ifDefined(size)}
				?blocking=${blocking}
				errorHandler='no-op'
			>
				<mo-loading-button type='raised' slot='primaryAction'>${primaryButtonText ?? t('Delete')}</mo-loading-button>
				${getContentTemplate(this, content)}
			</mo-dialog>
		`
	}

	protected override primaryAction = () => this.parameters.deletionAction?.call(this) ?? Promise.resolve()
}