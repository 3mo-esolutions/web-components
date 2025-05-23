import { component, property, Component, css, state, html, query, style, ifDefined, join } from '@a11d/lit'
import { type FieldNumber } from '@3mo/number-fields'
import { DirectionsByLanguage, Localizer } from '@3mo/localization'
import { TooltipPlacement, tooltip } from '@3mo/tooltip'
import { type DataGrid, type DataGridPagination } from './index.js'

Localizer.dictionaries.add('de', {
	'${page:number} of ${maxPage:number}': '${page} von ${maxPage}',
	'Export to CSV': 'Ansicht nach CSV exportieren',
	'Exporting file...': 'Datei wird exportiert...',
	'Auto': 'Auto'
})

Localizer.dictionaries.add('fa', {
	'${page:number} of ${maxPage:number}': '${page} از ${maxPage}',
	'Auto': 'خودکار',
})

/**
 * @element mo-data-grid-footer
 * @attr dataGrid
 * @attr page
 */
@component('mo-data-grid-footer')
export class DataGridFooter<TData> extends Component {
	private static readonly pageSizes = new Array<DataGridPagination & number>(10, 25, 50, 100, 250, 500)

	@property({ type: Object }) dataGrid!: DataGrid<TData, any>

	@property({ type: Number }) page = 1

	@state({
		async updated(this: DataGridFooter<TData>, value: boolean) {
			if (value === true) {
				await this.updateComplete
				await new Promise(r => requestAnimationFrame(r))
				this.pageNumberField.focus()
				this.pageNumberField.select()
			}
		}
	}) private manualPagination = false

	@query('mo-field-number') private readonly pageNumberField!: FieldNumber

	static override get styles() {
		return css`
			:host {
				grid-column: 1 / last-line;
				grid-row: 3;
				min-height: var(--mo-data-grid-footer-min-height);
				background: var(--mo-data-grid-footer-background);
			}

			:host(:not([hideTopBorder])) {
				border-top: var(--mo-data-grid-border);
			}

			#page-info {
				display: flex;
				align-items: center;

				span {
					user-select: none;
					padding-block: 0.25em;
					font-size: small;
				}

				#separator {
					color: var(--mo-color-gray);
					padding-inline: 0.25em;
				}

				#selected-length {
					color: color-mix(in srgb, var(--mo-color-accent), currentColor 12.5%);
					font-size: unset;
				}

				#length {
					color: var(--mo-color-gray);
				}

				mo-menu-item {
					font-size: smaller;
					min-height: 20px;
					cursor: pointer;
					gap: 8px;

					&::part(icon) {
						font-size: 18px;
					}

					&:not([selected]) {
						&::part(icon) {
							opacity: 0;
						}
					}
				}
			}

			#selection-info {
				color: var(--mo-color-accent);
				font-weight: 500;
				margin: 0 6px;
				font-size: smaller;
			}

			#csv {
				position: relative;
				color: var(--mo-color-gray);
				height: 32px;
				font-size: small;

				mo-icon-button {
					grid-row: 1;
					grid-column: 1;
					font-size: 24px;
					transition: 100ms;
					&[data-generating] {
						color: var(--mo-color-green);
						&:not([data-progress='1']) {
							transform: scale(0.66);
						}
					}
					&:hover {
						color: var(--mo-color-accent);
					}
				}

				mo-circular-progress {
					grid-row: 1;
					grid-column: 1;
					height: 32px;
					width: 32px;
					place-self: center;
					--mo-circular-progress-accent-color: var(--mo-color-green);
					--mo-circular-progress-track-color: var(--mo-color-transparent-gray-3);
				}

				span#exporting-percent {
					grid-column: 2;
					color: var(--mo-color-green);
					font-size: medium;
				}

				span#exporting-text {
					grid-column: 3;
					margin-inline-start: 4px;
					color: var(--mo-color-foreground);
				}
			}
		`
	}

	protected override get template() {
		this.toggleAttribute('hideTopBorder', this.dataGrid.hasFooter === false)
		return this.dataGrid.hasFooter === false ? html.nothing : html`
			<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' wrap='wrap-reverse' gap='6px' ${style({ flex: '1', padding: '0 6px', height: '100%' })}>
				<mo-flex direction='horizontal' alignItems='center' gap='3vw' ${style({ flexBasis: 'auto' })}>
					${this.paginationTemplate}
					${this.exportTemplate}
				</mo-flex>

				<mo-flex direction='horizontal' alignItems='center' gap='18px' wrap='wrap-reverse' ${style({ paddingInlineEnd: 'var(--mo-data-grid-footer-trailing-padding)' })}>
					${this.dataGrid.sumsTemplate}
					<slot name='sum'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private get paginationTemplate() {
		const isRtl = DirectionsByLanguage.get() === 'rtl'
		const hasUnknownDataLength = this.dataGrid.dataLength === undefined
		const pageText = hasUnknownDataLength ? this.page : t('${page:number} of ${maxPage:number}', { page: this.page, maxPage: this.dataGrid.maxPage ?? 0 })
		return !this.dataGrid.hasPagination ? html.nothing : html`
			<mo-flex direction='horizontal' alignItems='center' gap='3vw'>
				<mo-flex direction='horizontal' gap='4px' alignItems='center' justifyContent='center'>
					<mo-icon-button dense icon=${isRtl ? 'last_page' : 'first_page'}
						?disabled=${this.page === 1}
						@click=${() => this.setPage(1)}
					></mo-icon-button>

					<mo-icon-button dense icon=${isRtl ? 'keyboard_arrow_right' : 'keyboard_arrow_left'}
						?disabled=${this.page === 1}
						@click=${() => this.setPage(this.page - 1)}
					></mo-icon-button>

					<div ${style({ cursor: 'pointer', width: hasUnknownDataLength ? '40px' : '75px', textAlign: 'center' })}>
						${this.manualPagination ? html`
							<mo-field-number dense
								value=${this.page}
								@change=${(e: CustomEvent<number>) => this.handleManualPageChange(e.detail)}>
							</mo-field-number>
						` : html`
							<div ${style({ fontSize: 'small', userSelect: 'none' })} @click=${() => this.manualPagination = hasUnknownDataLength === false}>${pageText}</div>
						`}
					</div>

					<mo-icon-button dense icon=${isRtl ? 'keyboard_arrow_left' : 'keyboard_arrow_right'}
						?disabled=${!this.dataGrid.hasNextPage}
						@click=${() => this.setPage(this.page + 1)}
					></mo-icon-button>

					<mo-icon-button dense icon=${isRtl ? 'first_page' : 'last_page'}
						?disabled=${hasUnknownDataLength || this.page === this.dataGrid.maxPage}
						@click=${() => this.setPage(this.dataGrid.maxPage ?? 1)}
					></mo-icon-button>
				</mo-flex>

				${this.paginationInfoTemplate}
			</mo-flex>
		`
	}

	private get paginationInfoTemplate() {
		const from = (this.page - 1) * this.dataGrid.pageSize + 1
		const to = from + this.dataGrid.renderDataRecords.length - 1
		const rangeText = `${(Math.min(from, to)).format()}-${to.format()}`
		return html`
			<mo-popover-container id='page-info' placement='block-start'>
				<mo-flex alignItems='center' gap='6px' direction='horizontal' style='cursor: pointer'>
					<mo-flex direction='horizontal' alignItems='center'>
						${join([
							this.dataGrid.selectedData.length
								? html`<span id='selected-length'>${this.dataGrid.selectedData.length.format()}</span>`
								: html`<span id='range' tabindex='0'>${rangeText}</span>`,
							this.dataGrid.dataLength === undefined ? undefined : html`<span id='length'>${this.dataGrid.dataLength.format()}</span>`
						].filter(Boolean), html`<span id='separator'> / </span>`)}
					</mo-flex>

					<mo-icon icon='keyboard_arrow_up' style='font-size: 20px'></mo-icon>
				</mo-flex>
				<mo-menu slot='popover'>
					${!this.dataGrid?.supportsDynamicPageSize ? html.nothing : html`
						<mo-menu-item icon='done' ?selected=${this.dataGrid.pagination === 'auto'} @click=${() => this.handlePaginationChange('auto')}>${t('Auto')}</mo-menu-item>
					`}
					${DataGridFooter.pageSizes.map(size => html`
						<mo-menu-item icon='done' ?selected=${this.dataGrid.pageSize === size} @click=${() => this.handlePaginationChange(size)}>${size.format()}</mo-menu-item>
					`)}
				</mo-menu>
			</mo-popover-container>
		`
	}

	private handlePaginationChange(value: DataGridPagination) {
		if (this.dataGrid.maxPage && this.dataGrid.page > this.dataGrid.maxPage) {
			this.dataGrid.page = this.dataGrid.maxPage
		}
		this.dataGrid.setPagination(value)
	}

	private handleManualPageChange(value: number) {
		if (this.page === value) {
			return
		}

		this.setPage(value)
		this.manualPagination = false
	}

	private get exportTemplate() {
		if (!this.dataGrid.exportable) {
			return html.nothing
		}
		const { generationProgress, isGenerating } = this.dataGrid.csvController
		return html`
			<div id='csv'>
				<mo-grid columns='auto auto auto' gap='6px' rows='auto' alignItems='center'>
					<mo-icon-button dense
						?data-generating=${isGenerating}
						data-progress=${ifDefined(generationProgress)}
						${tooltip(t('Export to CSV'), TooltipPlacement.BlockStart)}
						@click=${() => this.dataGrid.generateCsv()}
					>
						<mo-icon slot='icon' variant='outlined' icon=${generationProgress === 1 ? 'cloud_done' : 'cloud_download'}></mo-icon>
					</mo-icon-button>
					${!isGenerating ? html.nothing : html`
						${generationProgress === 1 ? html.nothing : html`<mo-circular-progress></mo-circular-progress>`}
						<span id='exporting-percent'>${(generationProgress! * 100).formatAsPercent()}</span>
						<span id='exporting-text'>${t('Exporting file...')}</span>
					`}
				</mo-grid>
			</div>
		`
	}

	private setPage(value: number) {
		if (value < 1) {
			value = 1
		}

		if (this.dataGrid.maxPage && value > this.dataGrid.maxPage) {
			value = this.dataGrid.maxPage
		}

		this.manualPagination = false
		this.page = value
		this.dataGrid.setPage(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-footer': DataGridFooter<unknown>
	}
}