import { component, html, state } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'

/** A split button as the primary action: its menu picks the format, and its main button runs the export. */
@component('story-export-dialog')
export class ExportDialog extends DialogComponent<void, string> {
	@state() private format = 'PDF'

	protected override get template() {
		return html`
			<mo-dialog heading='Export invoices' size='small'>
				<mo-checkbox label='Include attachments'></mo-checkbox>
				<mo-split-button slot='primaryAction'>
					<mo-loading-button startIcon='download'>Export as ${this.format}</mo-loading-button>
					<mo-menu-item slot='more' @click=${() => this.format = 'PDF'}>PDF</mo-menu-item>
					<mo-menu-item slot='more' @click=${() => this.format = 'CSV'}>CSV</mo-menu-item>
					<mo-menu-item slot='more' @click=${() => this.format = 'Excel'}>Excel</mo-menu-item>
				</mo-split-button>
			</mo-dialog>
		`
	}

	protected override async primaryAction() {
		await new Promise(resolve => setTimeout(resolve, 1500))
		return this.format
	}
}
