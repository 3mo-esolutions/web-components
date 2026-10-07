import { component, html, state } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'

/** A dialog that says what it is doing while it works, in place of the spinner. */
@component('story-order-export-dialog')
export class OrderExportDialog extends DialogComponent {
	@state() private exporting = false

	protected override get template() {
		return html`
			<mo-loading-dialog heading='Export orders' primaryButtonText='Export' loadingHeading='Exporting'
				?loading=${this.exporting}
				style='background: linear-gradient(90deg, color-mix(in srgb, var(--mo-color-red), var(--mo-color-surface)), color-mix(in srgb, var(--mo-color-blue), var(--mo-color-surface)))'
			>
				<div slot='loading' style='display: flex; flex-direction: column; align-items: center; gap: 8px; width: 240px'>
					Preparing 1,204 orders
					<mo-linear-progress style='width: 100%'></mo-linear-progress>
				</div>
				Every order of this year is exported to a spreadsheet, which may take a moment.
			</mo-loading-dialog>
		`
	}

	protected override async primaryAction() {
		this.exporting = true
		try {
			await new Promise(resolve => setTimeout(resolve, 3000))
		} finally {
			this.exporting = false
		}
	}
}
