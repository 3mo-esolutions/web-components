import { component, html } from '@a11d/lit'
import { SelectionListItemChangeEvent } from '@3mo/list'
import { DateList } from './DateList.js'

@component('mo-year-list')
export class YearList extends DateList {
	private years?: Array<number>

	protected override get listItemsTemplate() {
		this.years ??= new Array(150)
			.fill(undefined)
			.map((_, i) => this.navigatingValue.year - 100 + i)
		return html`
			${this.years.map(year => html`
				<mo-selectable-list-item
					?selected=${this.value?.year === year}
					?data-now=${this.now.year === year}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected || !this.value ? void 0 : this.change.dispatch(this.value.with({ year }))}
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