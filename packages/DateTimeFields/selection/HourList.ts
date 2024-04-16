import { component, html, range } from '@a11d/lit'
import { DateList } from './DateList.js'
import { type SelectionListItemChangeEvent } from '@3mo/list'

@component('mo-hour-list')
export class HourList extends DateList {
	protected override get listItemsTemplate() {
		return html`
			${[...range(0, this.navigatingValue.hoursInDay)].map(hour => html`
				<mo-selectable-list-item
					?selected=${this.value?.hour === hour}
					?data-now=${this.now.hour === hour}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ hour }))}
				>${hour.format().padStart(2, this.zero.format())}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-hour-list': HourList
	}
}