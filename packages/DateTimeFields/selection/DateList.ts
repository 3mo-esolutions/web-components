import { Component, HTMLTemplateResult, css, event, html, nothing, property, query } from '@a11d/lit'
import { IntervalController } from '@3mo/interval-controller'
import { SelectableListItem } from '@3mo/list'

export abstract class DateList extends Component {
	@event() readonly change!: EventDispatcher<DateTime>

	@property({ type: Object }) navigatingValue!: DateTime
	@property({ type: Object, updated(this: DateList) { this.scrollIntoSelectedItem() } }) value?: DateTime

	private preventIntervalScrolling = false

	get now() { return new DateTime() }

	readonly intervalController = new IntervalController(this, 1000, () => {
		this.requestUpdate()
		if (this.preventIntervalScrolling === false) {
			this.scrollIntoSelectedItem()
		}
	})

	static override get styles() {
		return css`
			mo-scroller {
				min-width: 70px;
			}

			.pad {
				height: 50px;
			}

			mo-selectable-list-item {
				height: 32px;
			}

			mo-selectable-list-item[data-now] {
				outline: 2px dashed var(--mo-color-gray-transparent);
			}
		`
	}

	@query('mo-selectable-list-item[selected]') private readonly selectedListItem?: SelectableListItem
	@query('mo-selectable-list-item[data-now]') private readonly nowListItem?: SelectableListItem

	protected override connected() {
		this.scrollIntoSelectedItem()
	}

	protected override get template() {
		return this.navigatingValue === undefined ? nothing : html`
			<mo-scroller @pointerenter=${() => this.preventIntervalScrolling = true} @pointerleave=${() => this.preventIntervalScrolling = false}>
				<mo-selectable-list @change=${() => this.scrollIntoSelectedItem()}>
					<div class='pad'></div>
					${this.listItemsTemplate}
					<div class='pad'></div>
				</mo-selectable-list>
			</mo-scroller>
		`
	}

	protected async scrollIntoSelectedItem() {
		await this.updateComplete;
		(this.selectedListItem ?? this.nowListItem)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
	}

	protected abstract get listItemsTemplate(): HTMLTemplateResult
}