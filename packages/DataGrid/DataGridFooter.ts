import { component, property, Component, css, state, html, query, ifDefined, style } from '@a11d/lit'
import { type FieldNumber } from '@3mo/number-fields'
import { DirectionsByLanguage, Localizer } from '@3mo/localization'
import { TooltipPlacement, tooltip } from '@3mo/tooltip'
import { type DataGrid, type DataGridPagination, type FieldSelectDataGridPageSize } from './index.js'
import excelSvg from './excel.svg.js'

Localizer.register('de', {
	'${page:number} of ${maxPage:number}': '${page} von ${maxPage}',
	'Export current view to Excel': 'Aktuelle Ansicht nach Excel exportieren'
})

Localizer.register('fa', {
	'${page:number} of ${maxPage:number}': '${page} از ${maxPage}',
})

/**
 * @element mo-data-grid-footer
 * @attr dataGrid
 * @attr page
 */
@component('mo-data-grid-footer')
export class DataGridFooter<TData> extends Component {
	@property({ type: Object }) dataGrid!: DataGrid<TData, any>

	@property({ type: Number }) page = 1

	@state({
		async updated(this: DataGridFooter<TData>, value: boolean) {
			if (value === true) {
				await this.updateComplete
				const callback = 'requestIdleCallback' in globalThis ? requestIdleCallback : requestAnimationFrame
				await new Promise(r => callback(r))
				this.pageNumberField.focus()
				this.pageNumberField.select()
			}
		}
	}) private manualPagination = false

	@state({
		async updated(this: DataGridFooter<TData>, value: boolean) {
			if (value === true) {
				await this.updateComplete
				const callback = 'requestIdleCallback' in globalThis ? requestIdleCallback : requestAnimationFrame
				await new Promise(r => callback(r))
				this.pageSizeSelectField.focus()
				this.pageSizeSelectField.open = true
			}
		}
	}) private manualPageSize = false

	@query('mo-field-number') private readonly pageNumberField!: FieldNumber
	@query('mo-field-select-data-grid-page-size') private readonly pageSizeSelectField!: FieldSelectDataGridPageSize

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

				<mo-flex direction='horizontal' alignItems='center' gap='10px' wrap='wrap-reverse' ${style({ paddingInlineEnd: 'var(--mo-data-grid-footer-trailing-padding)' })}>
					${this.dataGrid.sumsTemplate}
					<slot name='sum'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private get paginationTemplate() {
		const isRtl = DirectionsByLanguage.get() === 'rtl'
		const hasUnknownDataLength = this.dataGrid.maxPage === undefined
		const pageText = hasUnknownDataLength ? this.page : t('${page:number} of ${maxPage:number}', { page: this.page, maxPage: this.dataGrid.maxPage ?? 0 })
		const from = (this.page - 1) * this.dataGrid.pageSize + 1
		const to = from + this.dataGrid.renderData.length - 1
		const pageSizeText = [
			`${(Math.min(from, to)).format()}-${to.format()}`,
			hasUnknownDataLength ? undefined : this.dataGrid.dataLength.format(),
		].filter(Boolean).join(' / ')
		return !this.dataGrid.hasPagination ? html.nothing : html`
			<mo-flex direction='horizontal' alignItems='center' gap='1vw'>
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

				<div ${style({ color: 'var(--mo-color-gray)', marginInlineStart: '8px' })}>
					${!this.manualPageSize ? html`
						<div ${style({ fontSize: 'small', userSelect: 'none' })} @click=${() => this.manualPageSize = true}>${pageSizeText}</div>
					` : html`
						<mo-field-select-data-grid-page-size dense ${style({ width: '90px' })}
							.dataGrid=${this.dataGrid}
							value=${ifDefined(this.dataGrid.pagination)}
							@change=${(e: CustomEvent<DataGridPagination>) => this.handlePaginationChange(e.detail)}>
						</mo-field-select-data-grid-page-size>
					`}
				</div>
			</mo-flex>
		`
	}

	private handlePaginationChange(value: DataGridPagination) {
		if (this.dataGrid.maxPage && this.dataGrid.page > this.dataGrid.maxPage) {
			this.dataGrid.page = this.dataGrid.maxPage
		}
		this.dataGrid.handlePaginationChange(value)
		this.manualPageSize = false
	}

	private handleManualPageChange(value: number) {
		if (this.page === value) {
			return
		}

		this.setPage(value)
		this.manualPagination = false
	}

	private get exportTemplate() {
		return !this.dataGrid.exportable ? html.nothing : html`
			<style>
				#export {
					height: 21px;
					width: 21px;
					aspect-ratio: 1 / 1;
					transition: .25s;
					-webkit-filter: grayscale(100%);
					filter: grayscale(100%);
					cursor: pointer;
				}

				#export:hover {
					-webkit-filter: grayscale(0%);
					filter: grayscale(0%);
				}
			</style>
			<img id='export'
				src=${`data:image/svg+xml,${encodeURIComponent(excelSvg)}`}
				${tooltip(t('Export current view to Excel'), TooltipPlacement.BlockStart)}
				@click=${() => this.dataGrid.exportExcelFile()}
			/>
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
		this.manualPageSize = false
		this.page = value
		this.dataGrid.handlePageChange(value)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-footer': DataGridFooter<unknown>
	}
}