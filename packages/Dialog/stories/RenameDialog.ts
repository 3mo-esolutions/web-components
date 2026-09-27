import { component, html, state } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'

/** A dialog component renders its `mo-dialog`, and `confirm()` resolves with what its primary action returns. */
@component('story-rename-dialog')
export class RenameDialog extends DialogComponent<{ readonly name: string }, string> {
	@state() private name = this.parameters.name

	protected override get template() {
		return html`
			<mo-dialog heading='Rename' primaryButtonText='Rename' primaryOnEnter>
				<mo-field-text label='Name' autofocus .value=${this.name} @input=${(event: CustomEvent<string>) => this.name = event.detail}></mo-field-text>
			</mo-dialog>
		`
	}

	protected override async primaryAction() {
		await new Promise(resolve => setTimeout(resolve, 1000))
		return this.name
	}
}