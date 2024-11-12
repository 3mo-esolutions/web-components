import { component, html, css, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { DialogComponent, NotificationComponent } from '@a11d/lit-application'
import { LocalStorage } from '@a11d/local-storage'
import { Localizer } from '@3mo/localization'
import { getContentTemplate, type DialogContent, type DialogSize } from '@3mo/dialog'

Localizer.dictionaries.add('de', {
	'Confirm Deletion': 'Löschung bestätigen',
	'Are you sure you want to delete ${label:string}?': 'Soll ${label} sicher gelöscht werden?',
	'Delete': 'Löschen',
	'this': 'das',
})

interface Parameters {
	readonly heading?: string
	readonly content?: DialogContent<DialogDeletion>
	readonly label?: string
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

			#label {
				display: inline-block;
				color: var(--mo-color-red);
				--_color: color-mix(in srgb, var(--mo-color-red), transparent 86%);
				padding-inline: 0.3em;
				background: var(--_color);
				border: 1px solid var(--_color);
				user-select: all;
				border-radius: 4px;
				&::selection {
					background: color-mix(in srgb, var(--mo-color-red), transparent 50%);
					color: var(--mo-color-foreground);
				}
			}
		`
	}

	protected override get template(): HTMLTemplateResult {
		const { heading, primaryButtonText, blocking, size, content } = this.parameters
		return html`
			<mo-dialog
				heading=${heading ?? t('Confirm Deletion')}
				size=${ifDefined(size)}
				?blocking=${blocking}
				errorHandler='no-op'
			>
				<mo-loading-button type='raised' slot='primaryAction'>${primaryButtonText ?? t('Delete')}</mo-loading-button>
				${getContentTemplate(this, content, this.defaultContentTemplate)}
			</mo-dialog>
		`
	}

	protected get defaultContentTemplate() {
		if (!this.parameters.label) {
			return html`${t('Are you sure you want to delete ${label:string}?', { label: t('this') })}`
		}
		const sentence = t('Are you sure you want to delete ${label:string}?', { label: this.parameters.label }).toString()
		const [before, after] = sentence.split(this.parameters.label)
		return html`
			${before}<span id='label'>${this.parameters.label}</span>${after}
		`
	}

	protected override primaryAction = () => this.parameters.deletionAction?.call(this) ?? Promise.resolve()
}