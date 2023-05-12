import { component, property, Component, html, css } from '@a11d/lit'

/**
 * @element mo-data-grid-footer-sum
 * @attr heading
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
				position: relative;
				max-height: 100%;
				line-height: 1em;
			}

			div {
				color: var(--mo-color-foreground-transparent);
				font-size: x-small;
				text-transform: uppercase;
				text-align: center;
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