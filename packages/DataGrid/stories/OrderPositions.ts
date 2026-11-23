import { Component, component, css, html, property, state } from '@a11d/lit'
import { positions, type Position } from '../../../stories/index.js'

/** The positions of a large order, every cell an editor: the amount of a position and the totals follow what is typed. */
@component('story-order-positions')
export class OrderPositions extends Component {
	@property({ type: Number, updated(this: OrderPositions) { this.positions = positions(this.count) } }) count = 1000

	@state() private positions = new Array<Position>()

	private delete(position: Position) {
		this.positions = this.positions.filter(p => p !== position)
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			mo-data-grid {
				height: 600px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-data-grid .data=${this.positions} editability='always' selectability='multiple'
				@cellEdit=${() => this.requestUpdate()}
			>
				<mo-data-grid-column-number heading='#' dataSelector='rank' nonEditable></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='Code' dataSelector='code' nonEditable></mo-data-grid-column-text>
				<mo-data-grid-column-text heading='Product' dataSelector='name'></mo-data-grid-column-text>
				<mo-data-grid-column-number heading='Quantity' dataSelector='quantity' min='0'></mo-data-grid-column-number>
				<mo-data-grid-column-text heading='Unit' dataSelector='unit'></mo-data-grid-column-text>
				<mo-data-grid-column-currency heading='Price' dataSelector='price' currency='EUR'></mo-data-grid-column-currency>
				<mo-data-grid-column-percent heading='Discount' dataSelector='discount' min='0' max='100'></mo-data-grid-column-percent>
				<mo-data-grid-column-percent heading='Tax' dataSelector='taxRate'></mo-data-grid-column-percent>
				<mo-data-grid-column-currency heading='Amount' dataSelector='amount' currency='EUR' sumHeading='Total' nonEditable .formatOptions=${{ maximumFractionDigits: 2 }}></mo-data-grid-column-currency>
				<mo-data-grid-column-date heading='Delivery' dataSelector='deliveryDate'></mo-data-grid-column-date>
				<mo-data-grid-column-text heading='Note' dataSelector='note'></mo-data-grid-column-text>
				<mo-data-grid-column-boolean heading='Sample' dataSelector='isSample'></mo-data-grid-column-boolean>
				<mo-data-grid-column-deletion @delete=${(e: CustomEvent<Position>) => this.delete(e.detail)}></mo-data-grid-column-deletion>
			</mo-data-grid>
		`
	}
}
