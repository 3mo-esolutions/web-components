import { Component, type HTMLTemplateResult, css, event, eventOptions, html, property, query, queryAll } from '@a11d/lit'
import { type SelectableListItem } from '@3mo/list'

export abstract class DateList extends Component {
	@event() readonly change!: EventDispatcher<DateTime>
	@event() readonly navigate!: EventDispatcher<DateTime>

	@property({ type: Object, event: 'navigate' }) navigatingValue!: DateTime
	@property({ type: Object }) value?: DateTime

	@query('.selector') private readonly selector!: HTMLElement
	@queryAll('mo-selectable-list-item') private readonly items!: Array<SelectableListItem>
	@query('mo-selectable-list-item[data-navigating]') private readonly navigatingItem?: SelectableListItem
	@query('mo-selectable-list-item[selected]') private readonly selectedItem?: SelectableListItem

	get zero() { return 0 }

	static override get styles() {
		return css`
			:host {
				position: relative;
			}

			mo-scroller {
				min-width: 70px;
				scrollbar-width: none;
			}

			.selector {
				position: absolute;
				transform: translateY(-50%);
				inset-block-start: 50%;
				inset-inline: 0;
				width: 100%;
				height: 32px;
				border-block: 2px dashed var(--mo-color-gray-transparent);
			}

			.pad {
				height: 200px;
			}

			mo-selectable-list-item {
				min-height: 32px;
				padding-block: 8px;
				scroll-snap-align: center;
			}
		`
	}

	protected override connected() {
		this.scrollIntoItem('navigating', 'instant')
	}

	protected override get template() {
		return this.navigatingValue === undefined ? html.nothing : html`
			<div class='selector'></div>
			<mo-scroller snapType='y mandatory'
				@scroll=${this.handleScroll}
				@scrollend=${this.handleScroll}
				@mouseenter=${() => this.navigateOnScroll = true}
				@mouseleave=${() => this.navigateOnScroll = false}
				@touchstart=${() => this.navigateOnScroll = true}
				@touchend=${() => this.navigateOnScroll = false}
			>
				<mo-selectable-list @change=${() => this.scrollIntoItem('selected', 'smooth')}>
					<div class='pad'></div>
					${this.listItemsTemplate}
					<div class='pad'></div>
				</mo-selectable-list>
			</mo-scroller>
		`
	}

	private async scrollIntoItem(key: 'navigating' | 'selected', behavior: ScrollBehavior = 'smooth') {
		await this.updateComplete
		const item = key === 'navigating' ? this.navigatingItem : this.selectedItem
		item?.scrollIntoView({ block: 'center', behavior })
	}

	private _navigateOnScroll = false
	get navigateOnScroll() { return this._navigateOnScroll }
	set navigateOnScroll(value) {
		if (value) {
			this._navigateOnScroll = value
		} else {
			setTimeout(() => this._navigateOnScroll = value, 100)
		}
	}


	@eventOptions({ passive: true })
	protected handleScroll(e: Event) {
		if (e.type === 'scroll' && 'onscrollend' in HTMLElement.prototype) {
			return
		}
		if (!this.navigateOnScroll) {
			return
		}
		const middleY = this.selector.getBoundingClientRect().y
		const middleItem = this.items.reduce((closest, item) => {
			const itemY = item.getBoundingClientRect().y
			return Math.abs(itemY - middleY) < Math.abs(closest.getBoundingClientRect().y - middleY) ? item : closest
		})
		middleItem?.dispatchEvent(new CustomEvent('navigate'))
	}

	protected abstract get listItemsTemplate(): HTMLTemplateResult
}