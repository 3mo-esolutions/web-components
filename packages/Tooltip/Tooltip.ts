import { component, css, property, html, unsafeCSS, Component, query, ifDefined } from '@a11d/lit'
import { Popover, PopoverPlacement } from '@3mo/popover'
import { TooltipPlacement } from './TooltipPlacement.js'

/**
 * @element mo-tooltip
 *
 * @attr placement - The placement of the tooltip.
 * @attr anchor - The element id that the tooltip is anchored to.
 *
 * @slot - Default slot for tooltip content
 */
@component('mo-tooltip')
export class Tooltip extends Component {
	@property() placement?: TooltipPlacement
	@property({ type: Object }) anchor?: HTMLElement

	@property({ type: Boolean, reflect: true }) protected rich?: boolean

	@query('mo-popover') protected readonly popover!: Popover

	static override get styles() {
		return css`
			:host {
				display: inline-block;
			}

			mo-popover {
				border-radius: var(--mo-toolbar-border-radius, var(--mo-border-radius, 4px));
				transition-duration: 175ms;
				transition-property: opacity, transform;
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockStart)}"] {
				transform: translateY(+10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.BlockEnd)}"] {
				transform: translateY(-10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineStart)}"] {
				transform: translateX(+10px);
			}

			mo-popover[placement="${unsafeCSS(PopoverPlacement.InlineEnd)}"] {
				transform: translateX(-10px);
			}

			mo-popover[open] {
				transform: translate(0);
			}

			:host(:not([rich])) mo-popover {
				background: var(--mo-tooltip-surface-color, var(--mo-color-surface, rgba(255, 255, 255, 0.75)));
				backdrop-filter: blur(40px);
				color: var(--mo-color-foreground);
				box-shadow: var(--mo-tooltip-shadow, var(--mo-shadow-deep, 0px 5px 5px -3px rgba(95, 81, 78, 0.2), 0px 8px 10px 1px rgba(95, 81, 78, 0.14), 0px 3px 14px 2px rgba(95, 81, 78, 0.12)));
				padding: 8px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover fixed
				.anchor=${this.anchor}
				placement=${ifDefined(this.placement)}
				alignment='center'
				openOnFocus
				openOnHover
			>
				<slot @slotChange=${() => this.rich = this.childElementCount > 0}></slot>
			</mo-popover>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tooltip': Tooltip
	}
}