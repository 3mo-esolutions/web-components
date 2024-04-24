import { component, property, Component, html, css } from '@a11d/lit'

/**
 * @element mo-data-grid-footer-sum
 *
 * @attr heading
 *
 * @slot - Sum of values
 */
@component('mo-data-grid-footer-sum')
export class DataGridFooterSum extends Component {
	@property() heading = ''

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				align-items: center;

				position: relative;
				max-height: 100%;
				padding: 5px 8px;

				line-height: 1em;
				user-select: all;
			}

			div {
				color: var(--mo-color-gray);
				font-size: 0.75rem;
				user-select: none;
			}

			mo-flex {
				user-select: all;
			}
		`
	}

	protected override get template() {
		return html`
			<div>${this.heading}</div>
			<mo-flex direction='horizontal' justifyContent='center'>
				<slot></slot>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-footer-sum': DataGridFooterSum
	}
}