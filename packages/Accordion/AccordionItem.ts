import { Component, component, css, event, html, ifDefined, property, query } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import '@3mo/icon'

/**
 * A single disclosure: a summary which is always visible and content which the summary reveals.
 *
 * It is a native "details" element underneath, which is what contributes the semantics, the keyboard handling
 * and find-in-page — searching the page reveals content which is collapsed. Opening and closing is animated in
 * CSS alone, towards a height nobody has to measure, so content of any size animates, growing content included.
 *
 * @element mo-accordion-item
 *
 * @attr heading - The text of the summary. The "heading" slot takes precedence over it.
 * @attr value - Identifies the item within an accordion. Items without one are not addressable through the accordion's "value".
 * @attr open - Whether the content is revealed.
 * @attr disabled - Whether the item refuses to open or close.
 *
 * @slot - The content which the summary reveals.
 * @slot heading - The heading, for headings which are more than text.
 * @slot start - Placed before the heading, for an icon or an avatar.
 * @slot end - Placed after the heading and before the expand icon, for a count or a status.
 *
 * @csspart summary - The row which is always visible.
 * @csspart heading - The heading within the summary.
 * @csspart expand-icon - The chevron which turns as the item opens.
 * @csspart content - The wrapper around the revealed content.
 *
 * @fires openChange - Dispatched with the new state whenever the item opens or closes. It bubbles, which is how an accordion follows its items.
 */
@component('mo-accordion-item')
export class AccordionItem extends Component {
	@event({ bubbles: true, composed: true }) readonly openChange!: EventDispatcher<boolean>

	@property() heading = ''
	@property() value?: string

	@property({
		type: Boolean,
		reflect: true,
		bindingDefault: true,
		event: 'openChange',
		updated(this: AccordionItem, open: boolean, previousOpen: boolean | undefined) {
			// The state an item is rendered with is not one it changed into.
			if (previousOpen !== undefined && previousOpen !== open) {
				this.openChange.dispatch(open)
			}
		}
	}) open = false

	@disabledProperty() disabled = false

	@query('details') readonly detailsElement!: HTMLDetailsElement

	static override get styles() {
		return css`
			:host {
				display: block;
				--_transition: 250ms cubic-bezier(0.2, 0, 0, 1);
			}

			details {
				/* Lets a size keyword take part in a transition, which is what animates the content to its own height. */
				interpolate-size: allow-keywords;

				&::details-content {
					height: 0;
					overflow: hidden;
					/* "content-visibility" flips discretely, so it is transitioned as well to hold the content visible while it collapses. */
					transition: height var(--_transition), content-visibility var(--_transition);
					transition-behavior: allow-discrete;
				}

				&[open]::details-content {
					height: auto;
				}
			}

			summary {
				display: flex;
				align-items: center;
				gap: 0.75rem;
				padding: 0.75rem 1rem;
				cursor: pointer;
				user-select: none;
				list-style: none;
				transition: background 150ms;

				&::marker, &::-webkit-details-marker {
					display: none;
				}

				&:hover {
					background: var(--mo-color-transparent-gray-1);
				}

				&:focus-visible {
					outline: 2px solid var(--mo-color-accent);
					outline-offset: -2px;
				}
			}

			[part=heading] {
				flex: 1;
				font-weight: 500;
			}

			[part=expand-icon] {
				color: var(--mo-color-gray);
				transition: rotate var(--_transition);
			}

			:host([open]) [part=expand-icon] {
				rotate: 180deg;
			}

			[part=content] {
				padding: 0 1rem 1rem;
			}

			:host([disabled]) summary {
				cursor: default;
				opacity: 0.5;

				&:hover {
					background: none;
				}
			}

			@media (prefers-reduced-motion: reduce) {
				summary, [part=expand-icon], details::details-content {
					transition: none;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<details ?open=${this.open} @toggle=${() => this.open = this.detailsElement.open}>
				<summary part='summary'
					tabindex=${this.disabled ? -1 : 0}
					aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
					@click=${this.handleSummaryClick}
				>
					<slot name='start'></slot>
					<div part='heading'>
						<slot name='heading'>${this.heading}</slot>
					</div>
					<slot name='end'></slot>
					<mo-icon part='expand-icon' icon='expand_more'></mo-icon>
				</summary>
				<div part='content'>
					<slot></slot>
				</div>
			</details>
		`
	}

	/** Opening and closing is the activation behavior of the summary, so refusing the click is all a disabled item has to do. */
	private readonly handleSummaryClick = (event: MouseEvent) => {
		if (this.disabled) {
			event.preventDefault()
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-accordion-item': AccordionItem
	}
}