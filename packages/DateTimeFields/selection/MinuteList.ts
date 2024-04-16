import { component, html, range } from '@a11d/lit'
import { type SelectionListItemChangeEvent } from '@3mo/list'
import { DateList } from './DateList.js'

@component('mo-minute-list')
export class MinuteList extends DateList {
	protected override get listItemsTemplate() {
		return html`
			${[...range(0, 60)].map(minute => html`
				<mo-selectable-list-item
					?selected=${this.value?.minute === minute}
					?data-now=${this.now.minute === minute}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ minute }))}
				>${minute.format().padStart(2, this.zero.format())}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-minute-list': MinuteList
	}
}