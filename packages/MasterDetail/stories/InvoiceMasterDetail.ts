import { bind, Component, component, css, html, property, state } from '@a11d/lit'
import type { FlexDirection } from '@3mo/flex'
import '@3mo/master-detail'
import '@3mo/card'
import '@3mo/collapsible-card'
import '@3mo/data-grid'
import { invoices, type Invoice } from '../../../stories/index.js'

/** A grid of invoices whose selected row shows its positions in the detail pane. */
@component('story-invoice-master-detail')
export class InvoiceMasterDetail extends Component {
	@property() direction: FlexDirection = 'vertical'
	@property({ type: Boolean }) collapsible = false

	@state() selection = new Array<Invoice>()
	@state() private collapsed = false

	static override get styles() {
		return css`
			:host {
				display: block;
				height: 700px;
			}

			mo-card {
				--mo-card-body-padding: 0px;
			}

			mo-flex {
				padding: 1rem;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-master-detail direction=${this.direction} minSize='150px' ?collapsed=${this.collapsed}>
				<mo-card slot='master' heading='Invoices'>
					<mo-data-grid selectability='single' selectOnClick .data=${[...invoices]} .selectedData=${bind(this, 'selection')}>
						<mo-data-grid-column-number heading='Number' dataSelector='id' width='7rem'></mo-data-grid-column-number>
						<mo-data-grid-column-text heading='Customer' dataSelector='customer'></mo-data-grid-column-text>
						<mo-data-grid-column-currency heading='Total' dataSelector='total' currency='EUR' width='9rem'></mo-data-grid-column-currency>
					</mo-data-grid>
				</mo-card>
				${!this.selection.length ? html.nothing : this.detailTemplate(this.selection[0]!)}
			</mo-master-detail>
		`
	}

	private detailTemplate(invoice: Invoice) {
		const positions = html`
			<mo-flex gap='0.5rem'>
				${invoice.positions.map(position => html`<div>${position}</div>`)}
			</mo-flex>
		`
		return this.collapsible
			? html`
				<mo-collapsible-card slot='detail' heading=${`Positions of #${invoice.id}`}
					?collapsed=${this.collapsed}
					@collapse=${(e: CustomEvent<boolean>) => this.collapsed = e.detail}
				>${positions}</mo-collapsible-card>
			`
			: html`<mo-card slot='detail' heading=${`Positions of #${invoice.id}`}>${positions}</mo-card>`
	}
}