import { Component, HTMLTemplateResult, component, css, html, property, query } from '@a11d/lit'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { SlotController } from '@3mo/slot-controller'
import { observeResize } from '@3mo/resize-observer'

@component('mo-timeline-item')
export class TimelineItem extends Component {
	private static readonly defaultLine = html`<div class='line'></div>`

	@property() icon?: string
	@property() meta?: string
	@property({ type: Object }) line?: (defaultLine?: HTMLTemplateResult) => HTMLTemplateResult

	@query('slot[name=icon]') private readonly iconSlot?: HTMLSlotElement

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)
	protected readonly slotController = new SlotController(this)

	get timeline() {
		return this.closest('mo-timeline') ?? undefined
	}

	private get previousItem() {
		const items = this.timeline?.items ?? []
		const index = items.indexOf(this)
		return items[index - 1]
	}

	private get nextItem() {
		const items = this.timeline?.items ?? []
		const index = items.indexOf(this)
		return items[index + 1]
	}

	static override get styles() {
		const sharedStyles = css`
			:host {
				display: grid;
			}

			.line {
				background-color: var(--mo-color-gray-transparent);
			}

			slot:not([name]), slot[name=meta] {
				display: block;
			}

			slot[name=meta] {
				color: var(--mo-color-gray);
				font-size: small;
				text-wrap: nowrap;
			}

			.bullet-point {
				aspect-ratio: 1;
				width: 10px;
				height: 10px;
				background: var(--mo-timeline-item-bullet-color, var(--mo-color-gray));
				border-radius: 50%;
			}
		`

		const verticalStyles = css`
			:host([direction=vertical]) {
				grid-column: span 3;
				min-height: 35px;
				grid-template-columns: subgrid;
			}

			:host([direction=vertical]) .line {
				width: 2px;
				height: 100%;
			}

			:host([direction=vertical]) .time {
				height: 100%;
			}

			:host([direction=vertical]) slot[name=icon] {
				display: inline-block;
				position: sticky;
				inset-block-start: 5px;
				margin-block-start: -2px;
			}

			:host([direction=vertical]:not(:last-of-type)) slot:not([name]), :host([direction=vertical]:not(:last-of-type)) slot[name=meta] {
				padding-block-end: var(--mo-timeline-item-padding-end, 35px);
			}

			:host([direction=vertical]:not(:first-of-type)) .leading {
				display: flex;
				gap: 2px;
				height: calc(16px - var(--__icon-height, 10px));
				justify-content: center;
			}

			:host([direction=vertical]) .trailing {
				display: flex;
				flex: 1;
				gap: 2px;
				height: 100%;
				justify-content: center;
			}
		`

		const horizontalStyles = css`
			:host([direction=horizontal]) {
				grid-template-rows: subgrid;
				grid-row: span 3;
				text-align: center;
			}

			:host([direction=horizontal]) .line {
				height: 2px;
				width: 100%;
			}

			:host([direction=horizontal]) .time {
				flex-direction: row;
				width: 100%;
			}

			:host([direction=horizontal]) slot[name=icon] {
				display: inline-block;
				position: sticky;
				inset-inline-start: 0;
				margin-inline-start: -2px;
			}

			:host([direction=horizontal]:not(:last-of-type)) slot:not([name]), :host([direction=horizontal]:not(:last-of-type)) slot[name=meta] {
				padding-inline: 10px;
			}

			:host([direction=horizontal]) .leading {
				display: flex;
				flex-direction: column;
				gap: 2px;
				width: calc(50% - var(--__icon-width, 10px) / 2);
				justify-content: center;
			}

			:host([direction=horizontal]) .trailing {
				display: flex;
				flex-direction: column;
				flex: 1;
				gap: 2px;
				width: calc(50% - var(--__icon-width, 10px) / 2);
				justify-content: center;
			}
		`

		return css`
			${sharedStyles}
			${verticalStyles}
			${horizontalStyles}
		`
	}

	protected override get template() {
		return html`
			${this.metaTemplate}
			${this.lineTemplate}
			${this.contentTemplate}
		`
	}

	get hasMeta() {
		return this.slotController.hasAssignedContent('meta')
			|| !!this.meta
			|| this.metaDefaultTemplate !== html.nothing
	}

	protected get metaTemplate() {
		return !this.hasMeta ? html.nothing : html`
			<mo-flex gap='4px' direction=${this.getAttribute('direction') === 'horizontal' ? 'vertical-reversed' : 'vertical'}>
				<slot name='meta' part='meta'>
					${this.metaDefaultTemplate}
				</slot>
			</mo-flex>
		`
	}

	protected get metaDefaultTemplate() {
		return !this.meta ? html.nothing : html`<span>${this.meta}</span>`
	}

	protected get lineTemplate() {
		return html`
			<mo-flex class='time' alignItems='center'>
				<div class='leading'>
					${!this.previousItem ? html.nothing : this.previousItem.getLineTemplate()}
				</div>
				${this.iconTemplate}
				<div class='trailing'>
					${!this.nextItem ? html.nothing : this.getLineTemplate()}
				</div>
			</mo-flex>
		`
	}

	protected get iconTemplate() {
		return html`
			<slot name='icon' part='icon' ${observeResize(() => this.calculateIconHeight())}>
				${this.iconDefaultTemplate}
			</slot>
		`
	}

	protected get iconDefaultTemplate() {
		return !this.icon ? html`<div class='bullet-point'></div>` : html`${this.icon}`
	}

	private calculateIconHeight() {
		const { width, height } = this.iconSlot?.getBoundingClientRect() ?? { width: 0, height: 0 }
		this.style.setProperty('--__icon-width', `${width}px`)
		this.style.setProperty('--__icon-height', `${height}px`)
	}

	private getLineTemplate() {
		return this.line?.(TimelineItem.defaultLine) ?? TimelineItem.defaultLine
	}

	protected get contentTemplate() {
		return html`<slot>${this.contentDefaultTemplate}</slot>`
	}

	protected get contentDefaultTemplate() {
		return html.nothing
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-timeline-item': TimelineItem
	}
}