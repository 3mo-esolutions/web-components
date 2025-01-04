import { css, html, style, Component, component, property, query, eventListener } from '@a11d/lit'
import { type FetchableDataGridParametersType } from '@3mo/fetchable-data-grid'
import { tooltip } from '@3mo/tooltip'
import { DialogAlert, GenericDialog } from '@3mo/standard-dialogs'
import { Localizer } from '@3mo/localization'
import { type Menu } from '@3mo/menu'
import { ModdableDataGridMode } from './ModdableDataGridMode.js'
import { DialogMode } from './DialogMode.js'
import { type ModdableDataGrid } from './ModdableDataGrid.js'

Localizer.dictionaries.add({
	de: {
		'Save changes': 'Änderungen speichern',
		'Copy': 'Kopie',
		'Move to archive': 'Ins Archiv verschieben',
		'Save as a new view': 'Als neue Ansicht speichern',
		'Discard changes': 'Änderungen verwerfen',
		'Discard': 'Verwerfen',
		'Archive': 'Archivieren',
		'Don\'t Save': 'Nicht speichern',
		'Edit': 'Bearbeiten',
		'More options': 'Weitere Optionen',
		'Unsaved changes': 'Änderungen',
		'Do you want to save the new changes for "${name:string}" before switching view?': 'Sollen die Änderungen in der Ansicht "${name}" vor dem Fortfahren gespeichert werden?',
		'Do you want to discard changes of view "${name:string}"?': 'Sollen die Änderungen in der Ansicht "${name}" verworfen werden?',
	}
})

@component('mo-moddable-data-grid-chip')
export class ModdableDataGridChip<TData, TParameters extends FetchableDataGridParametersType> extends Component {
	@property({ type: Object }) dataGrid!: ModdableDataGrid<TData, TParameters>

	@property({
		type: Object,
		updated(this: ModdableDataGridChip<TData, TParameters>, mode?: ModdableDataGridMode<TData, TParameters>) {
			this.toggleAttribute('data-archived', mode?.archived)
		}
	}) mode!: ModdableDataGridMode<TData, TParameters>

	@property({ type: Boolean, reflect: true }) selected = false

	@query('mo-menu') readonly menu!: Menu
	@query('mo-flex') readonly optionsContainer!: HTMLElement

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				z-index: 5;
			}

			mo-chip {
				height: 30px;
				--mo-chip-background-color: color-mix(in srgb, var(--mo-color-foreground), transparent 85%);
			}

			:host([selected]) mo-chip {
				--mo-chip-background-color: var(--mo-color-accent);
				--mo-chip-foreground-color: var(--mo-color-on-accent);
				font-weight: 500;
			}

			:host(:hover:not([selected])) mo-chip {
				--mo-chip-background-color: color-mix(
					in srgb,
					color-mix(in srgb, var(--mo-color-foreground), transparent 85%),
					color-mix(in srgb, var(--mo-color-accent), transparent 75%)
				);
			}

			:host([selected][data-archived]) mo-chip {
				--mo-chip-background-color: color-mix(
					in srgb,
					color-mix(in srgb, var(--mo-color-foreground), transparent 45%),
					color-mix(in srgb, var(--mo-color-accent), transparent 25%)
				);
			}

			#changed {
				margin-inline-end: 5px;
			}

			mo-icon-button {
				font-size: 18px;
			}

			:host([selected]:not([readOnly])) mo-icon-button:not([data-no-border])::before {
				content: '';
				border-inline-start: 1px solid rgba(255, 255, 255, 0.4);
				height: 70%;
				margin: 0 2px;
			}

			mo-menu {
				color: var(--mo-color-on-surface);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-chip>
				<span id='title'>
					${this.mode.archived ? `[${this.mode.name}]` : this.mode.name}
				</span>

				${!this.selected ? html.nothing : html`
					<mo-flex slot='end' direction='horizontal' ${style({ margin: '0 -4px 0 4px' })}>
						${!this.dataGrid.hasUnsavedChanges ? this.contextMenuTemplate : html`
							<span id='changed'>*</span>
							<mo-icon-button dense icon='undo' ${tooltip(t('Discard changes'))} @click=${() => this.discard()}></mo-icon-button>
							<mo-icon-button dense icon='done' ${tooltip(t('Save changes'))} @click=${() => this.saveChanges()}></mo-icon-button>
							${this.contextMenuTemplate}
						`}
					</mo-flex>
				`}
			</mo-chip>
		`
	}

	private get contextMenuTemplate() {
		return html`
			<mo-popover-container fixed>
				<mo-icon-button icon='more_vert' dense
					?data-no-border=${!this.dataGrid.hasUnsavedChanges}
					${tooltip(t('More options'))}
				></mo-icon-button>

				<mo-menu slot='popover' fixed>
					${!this.dataGrid.hasUnsavedChanges ? html.nothing : html`
						<mo-menu-item icon='undo' @click=${() => this.discard()}>
							${t('Discard changes')}
						</mo-menu-item>
						<mo-menu-item icon='done' @click=${() => this.saveChanges()}>
							${t('Save changes')}
						</mo-menu-item>
						<mo-menu-item icon='check_circle' data-test-id='save-as-new' @click=${() => this.saveAsNew()}>
							${t('Save as a new view')}
						</mo-menu-item>
						<mo-line role='separator'></mo-line>
					`}

					<mo-menu-item icon='edit' data-test-id='edit' @click=${() => this.edit()}>${t('Edit')}</mo-menu-item>
					<mo-menu-item icon='content_copy' data-test-id='copy' @click=${() => this.copy()}>${t('Copy')}</mo-menu-item>

					${this.mode.archived ? html.nothing : html`
						<mo-menu-item data-test-id='archive' icon='archive' @click=${() => this.archive()}>
							${t('Move to archive')}
						</mo-menu-item>
					`}

					<mo-line role='separator'></mo-line>

					<mo-menu-item icon='delete' data-test-id='delete' @click=${() => this.delete()}>
						${t('Delete')}
					</mo-menu-item>
				</mo-menu>
			</mo-popover-container>
		`
	}

	private async discard() {
		await new DialogAlert({
			heading: t('Discard changes'),
			content: t('Do you want to discard changes of view "${name:string}"?', { name: this.mode.name }),
			primaryButtonText: t('Discard'),
		}).confirm()
		await this.mode.save(this.dataGrid)
	}

	private async edit() {
		const mode = await new DialogMode<TData, TParameters>({ dataGrid: this.dataGrid, mode: this.mode }).confirm()
		await mode?.select(this.dataGrid)
	}

	private async copy() {
		const mode = await new DialogMode<TData, TParameters>({ dataGrid: this.dataGrid, mode: this.mode.copy() }).confirm()
		await mode?.select(this.dataGrid)
	}

	private async saveAsNew() {
		const mode = await new DialogMode<TData, TParameters>({ dataGrid: this.dataGrid, mode: this.dataGrid.currentMode.copy('') }).confirm()
		await mode?.select(this.dataGrid)
	}

	private async saveChanges() {
		this.mode = this.dataGrid.currentMode
		await this.mode.save(this.dataGrid)
	}

	private async archive() {
		await this.mode.archive(this.dataGrid)
		this.menu.open = false
	}

	private delete() {
		return this.mode.delete(this.dataGrid)
	}

	@eventListener('click')
	protected async handleClick(e: PointerEvent) {
		if (e.composedPath().includes(this.renderRoot.querySelector('mo-flex')!)) {
			return
		}

		if (this.dataGrid.mode?.id === this.mode.id) {
			this.dataGrid.modesController.set(undefined)
			return
		}

		if (this.dataGrid.mode && this.dataGrid.hasUnsavedChanges) {
			const saveChanges = await new GenericDialog({
				heading: t('Unsaved changes'),
				content: t('Do you want to save the new changes for "${name:string}" before switching view?', { name: this.dataGrid.mode.name }),
				primaryButtonText: t('Save'),
				primaryAction: () => true,
				secondaryButtonText: t('Don\'t Save'),
				secondaryAction: () => false,
			}).confirm()

			if (saveChanges) {
				await this.dataGrid.currentMode.save(this.dataGrid)
			}
		}

		await this.mode.select(this.dataGrid)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-moddable-data-grid-chip': ModdableDataGridChip<unknown, any>
	}
}