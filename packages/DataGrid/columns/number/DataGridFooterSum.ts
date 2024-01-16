import { component, property, Component, html, css, style } from '@a11d/lit'

/**
 * @element mo-data-grid-footer-sum
 *
 * @attr heading
 * @attr align
 * @attr weight
 *
 * @slot - Sum of values
 */
@component('mo-data-grid-footer-sum')
export class DataGridFooterSum extends Component {
	@property() heading = ''
	@property() align: 'start' | 'end' | 'center' = 'center'
	@property() weight = '400'

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				position: relative;
				max-height: 100%;
				line-height: 1em;
				user-select: all;
			}

			div {
				color: var(--mo-color-gray);
				font-size: 0.75rem;
			}
		`
	}

	protected override get template() {
		return html`
			<style>
				* {
					font-weight: ${this.weight};
				}
			</style>
			<div ${style({ textAlign: this.align })}>${this.heading}</div>
			<mo-flex direction='horizontal' justifyContent='center' alignItems=${this.align}>
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