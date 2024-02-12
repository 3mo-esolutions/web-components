import { component, html } from '@a11d/lit'
import { SelectionListItemChangeEvent } from '@3mo/list'
import { DateList } from './DateList.js'

@component('mo-year-list')
export class YearList extends DateList {
	private readonly nowYear = new DateTime().year
	private years = new Array(150)
		.fill(undefined)
		.map((_, i) => this.nowYear - 100 + i)

	protected override connected() {
		this.scrollIntoSelectedItem(false)
	}

	protected override get listItemsTemplate() {
		const now = this.now
		return html`
			${this.years.map(year => html`
				<mo-selectable-list-item
					?selected=${this.value?.year === year}
					?data-now=${now.year === year}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ year }))}
				>${year.format()}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-year-list': YearList
	}
}