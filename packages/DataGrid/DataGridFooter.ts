import { component, property, Component, css, state, html, nothing, query, ifDefined, style } from '@a11d/lit'
import { FieldNumber } from '@3mo/number-fields'
import { Localizer, LanguageCode } from '@3mo/localization'
import { DataGrid, DataGridPagination, FieldSelectDataGridPageSize } from './index.js'

Localizer.register(LanguageCode.German, {
	'${page:number} of ${maxPage:number}': '${page} von ${maxPage}',
})

Localizer.register(LanguageCode.Farsi, {
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
				await new Promise(resolve => setTimeout(resolve, 10))
				this.pageNumberField.focus()
				this.pageNumberField.select()
			}
		}
	}) private manualPagination = false

	@state({
		async updated(this: DataGridFooter<TData>, value: boolean) {
			if (value === true) {
				await this.updateComplete
				await new Promise(resolve => setTimeout(resolve, 10))
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
			}

			:host(:not([hideTopBorder])) {
				border-top: var(--mo-data-grid-border);
			}

			img {
				height: 100%;
				transition: .25s;
				-webkit-filter: grayscale(100%);
				filter: grayscale(100%);
			}

			img:hover {
				-webkit-filter: grayscale(0%);
				filter: grayscale(0%);
			}
		`
	}

	protected override get template() {
		this.toggleAttribute('hideTopBorder', this.dataGrid.hasFooter === false)
		return this.dataGrid.hasFooter === false ? nothing : html`
			<mo-flex direction='horizontal' justifyContent='space-between' alignItems='center' wrap='wrap-reverse' gap='6px' ${style({ flex: '1', padding: '6px' })}>
				<mo-flex direction='horizontal' alignItems='center' gap='1vw' ${style({ flexBasis: 'auto' })}>
					${this.paginationTemplate}
				</mo-flex>

				<mo-flex direction='horizontal' alignItems='center' gap='8px' wrap='wrap-reverse' ${style({ textAlign: 'right', paddingInlineEnd: 'var(--mo-data-grid-footer-trailing-padding)' })}>
					${this.dataGrid.sumsTemplate}
					<slot name='sum'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	private get paginationTemplate() {
		const isRtl = getComputedStyle(this).direction === 'rtl'
		const hasUnknownDataLength = this.dataGrid.maxPage === undefined
		const pageText = hasUnknownDataLength ? this.page : t('${page:number} of ${maxPage:number}', { page: this.page, maxPage: this.dataGrid.maxPage ?? 0 })
		const from = (this.page - 1) * this.dataGrid.pageSize + 1
		const to = from + this.dataGrid.renderData.length - 1
		const pageSizeText = [
			`${(Math.min(from, to)).format()}-${to.format()}`,
			hasUnknownDataLength ? undefined : this.dataGrid.dataLength.format(),
		].filter(Boolean).join(' / ')
		return !this.dataGrid.hasPagination ? nothing : html`
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
						<div ${style({ fontSize: 'var(--mo-font-size-s)' })} @click=${() => this.manualPagination = hasUnknownDataLength === false}>${pageText}</div>
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
					<div ${style({ fontSize: 'var(--mo-font-size-s)' })} @click=${() => this.manualPageSize = true}>${pageSizeText}</div>
				` : html`
					<mo-field-select-data-grid-page-size dense ${style({ width: '90px' })}
						.dataGrid=${this.dataGrid}
						value=${ifDefined(this.dataGrid.pagination)}
						@change=${(e: CustomEvent<DataGridPagination>) => this.handlePaginationChange(e.detail)}>
					</mo-field-select-data-grid-page-size>
				`}
			</div>
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