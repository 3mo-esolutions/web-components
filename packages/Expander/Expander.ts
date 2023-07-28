import { component, css, Component, property, html, query, event } from '@a11d/lit'

/**
 * @element mo-expander - A component that expands and collapses its content.
 *
 * @attr open - Whether the expander is open.
 * @attr heading - The heading of the expander.
 *
 * @slot - The content of the expander.
 * @slot heading - The heading of the expander.
 *
 * @csspart header - The header of the expander containing the "heading" and the "expand-collapse-icon-button".
 * @csspart heading - The heading of the expander.
 * @csspart expand-collapse-icon-button - The expand-collapse-icon-button of the expander.
 *
 * @fires openChange - Dispatched when the expander is opened or closed.
 */
@component('mo-expander')
export class Expander extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>

	@property({ reflect: true, type: Boolean }) open = false
	@property({ reflect: true }) heading = ''

	@query('details') readonly detailsElement!: HTMLDetailsElement

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			mo-flex[part=header] {
				color: var(--mo-color-accent);
			}

			details > summary {
				list-style: none;
			}

			details summary::marker, details summary::-webkit-details-marker {
				display: none;
			}
		`
	}

	protected override get template() {
		return html`
			<details ?open=${this.open} @toggle=${() => this.setOpen(this.detailsElement.open)}>
				<summary>${this.headerTemplate}</summary>
				${this.contentTemplate}
			</details>
		`
	}

	protected get headerTemplate() {
		return html`
			<mo-flex part='header' direction='horizontal' alignItems='center' gap='10px'>
				<slot name='heading'>
					${this.defaultHeadingTemplate}
				</slot>
				<mo-expand-collapse-icon-button part='expand-collapse-icon-button'
					?open=${this.open}
					@click=${() => this.setOpen(!this.open)}
				></mo-expand-collapse-icon-button>
			</mo-flex>
		`
	}

	protected get defaultHeadingTemplate() {
		return html`<mo-heading part='heading' typography='heading4'>${this.heading}</mo-heading>`
	}

	protected get contentTemplate() {
		return html`<slot></slot>`
	}

	private setOpen(open: boolean) {
		this.open = open
		this.openChange.dispatch(open)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-expander': Expander
	}
}