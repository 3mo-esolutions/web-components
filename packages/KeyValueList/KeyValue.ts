import { Component, component, css, html, property, type PropertyValues } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'

/**
 * A single key–value pair of a "mo-key-value-list".
 *
 * @element mo-key-value
 *
 * @attr key - The name of the pair. Superseded by the "key" slot.
 * @attr value - The value of the pair, for one which needs no markup. Superseded by the default slot, and the property "bind()" writes into by default.
 * @attr hiddenWhenEmpty - Whether the pair takes itself out of the list while its value is empty, instead of showing a placeholder.
 * @attr empty - Whether the value is empty. Derived from the slotted content and therefore read-only.
 *
 * @slot - The value of the pair. A placeholder stands in for it while it is empty.
 * @slot key - The name of the pair, for when it takes more than the text of the "key" attribute.
 *
 * @csspart key - The element holding the name of the pair.
 * @csspart value - The element holding the value of the pair.
 */
@component('mo-key-value')
export class KeyValue extends Component {
	@property() key?: string
	@property({ bindingDefault: true }) value?: string
	@property({ type: Boolean, reflect: true }) hiddenWhenEmpty = false

	protected readonly slotController = new SlotController(this)

	get empty() {
		return !this.slotController.hasAssignedContent('') && !this.hasValue
	}

	private get hasValue() {
		return !!this.value?.toString().length
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.toggleAttribute('empty', this.empty)
	}

	static override get styles() {
		return css`
			:host {
				position: relative;
				display: grid;
				grid-template-columns: subgrid;
				grid-column: auto / span var(--_column-span, 2);
				align-items: center;
				min-height: 25px;
				padding-block: calc(var(--mo-key-value-list-row-gap, 0.75rem) * 0.5);
			}

			:host([hidden]), :host([empty][hiddenWhenEmpty]) {
				display: none;
			}

			:host::before {
				content: '';
				position: absolute;
				inset-block: 0;
				inset-inline-end: calc(-0.25 * var(--mo-key-value-list-column-gap, 0.75rem));
				width: 1px;
				background-color: var(--_column-divider, transparent);
			}

			:host::after {
				content: '';
				position: absolute;
				inset-block-end: -1px;
				inset-inline-start: 0;
				height: 1px;
				width: calc(100% + var(--mo-key-value-list-column-gap, 0.75rem));
				background-color: var(--_row-divider, transparent);
			}

			dt, dd {
				margin: 0;
				font-size: small;
			}

			dt {
				color: var(--mo-color-gray);
				font-weight: 500;
				line-height: 1.3;
			}

			dd {
				user-select: all;
				line-height: 1.35;
			}

			::slotted(*) {
				user-select: text;
			}

			.placeholder {
				color: var(--mo-color-gray);
				user-select: none;
			}

			:host(:not([empty])) .placeholder {
				display: none;
			}
		`
	}

	protected override get template() {
		return html`
			<dt part='key'>
				<slot name='key'>${this.key}</slot>
			</dt>
			<dd part='value'>
				<slot>${this.value}</slot>
				<span class='placeholder'>-</span>
			</dd>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-key-value': KeyValue
	}
}