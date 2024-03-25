import { component, TemplateResult, html, css } from '@a11d/lit'
import { DialogComponent, NotificationComponent } from '@a11d/lit-application'
import { LocalStorage } from '@a11d/local-storage'
import { Localizer } from '@3mo/localization'

Localizer.register('de', {
	'Deletion Confirmation': 'Löschbestätigung',
})

type Parameters = {
	readonly content: string | TemplateResult
	deletionAction?: () => void | PromiseLike<void>
}

@component('mo-dialog-deletion')
export class DialogDeletion extends DialogComponent<Parameters> {
	static readonly deletionConfirmation = new LocalStorage('DialogDeletion.DeletionConfirmation', true)

	override async confirm() {
		if (DialogDeletion.deletionConfirmation.value === false) {
			try {
				await this.parameters.deletionAction?.()
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

	protected override get template() {
		return html`
			<mo-dialog heading=${t('Deletion Confirmation')}>
				<mo-loading-button type='raised' slot='primaryAction'>${t('Delete')}</mo-loading-button>
				${this.parameters.content}
			</mo-dialog>
		`
	}

	protected override primaryAction = () => this.parameters.deletionAction?.() ?? Promise.resolve()
}