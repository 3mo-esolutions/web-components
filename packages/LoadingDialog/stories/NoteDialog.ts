import { component, html, state } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'

/** A dialog that is loading while its primary action saves. */
@component('story-note-dialog')
export class NoteDialog extends DialogComponent {
	@state() private saving = false

	protected override get template() {
		return html`
			<mo-loading-dialog heading='Edit note' primaryButtonText='Save' ?loading=${this.saving}>
				<mo-field-text-area label='Note' value='Call the customer back on Monday.'></mo-field-text-area>
			</mo-loading-dialog>
		`
	}

	protected override async primaryAction() {
		this.saving = true
		try {
			await new Promise(resolve => setTimeout(resolve, 2000))
		} finally {
			this.saving = false
		}
	}
}