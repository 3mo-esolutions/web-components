import { component, css, html } from '@a11d/lit'
import { type SelectionListItemChangeEvent } from '@3mo/list'
import { DateList } from './DateList.js'

@component('mo-month-list')
export class MonthList extends DateList {
	static override get styles() {
		return css`
			${super.styles}

			mo-scroller {
				min-width: 125px;
			}
		`
	}

	private get monthNames() {
		return new Array(this.navigatingValue.monthsInYear)
			.fill(undefined)
			.map((_, i) => this.navigatingValue.yearStart.add({ months: i }))
			.map(date => [date.month, date.format({ month: 'long' })] as const)
	}

	protected override get listItemsTemplate() {
		return html`
			${this.monthNames.map(([month, name]) => html`
				<mo-selectable-list-item
					?selected=${this.value?.month === month}
					?data-now=${this.now.month === month}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ month }))}
				>${name}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-month-list': MonthList
	}
}