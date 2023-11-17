import { component, html, range } from '@a11d/lit'
import { SelectionListItemChangeEvent } from '@3mo/list'
import { DateList } from './DateList.js'

@component('mo-second-list')
export class SecondList extends DateList {
	protected override get listItemsTemplate() {
		return html`
			${[...range(0, 60)].map(second => html`
				<mo-selectable-list-item
					?selected=${this.value?.second === second}
					?data-now=${this.now.second === second}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ second }))}
				>${second.format().padStart(2, this.zero.format())}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-second-list': SecondList
	}
}