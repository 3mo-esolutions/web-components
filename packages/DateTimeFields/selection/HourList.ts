import { component, css, html, property, range } from '@a11d/lit'
import { DateList } from './DateList.js'
import { type SelectionListItemChangeEvent } from '@3mo/list'

@component('mo-hour-list')
export class HourList extends DateList {
	/** Defaults to the language's convention, so English lists "02 PM" where German lists "14". */
	@property() hourCycle?: 'h11' | 'h12' | 'h23' | 'h24'

	private labelTemplate(hour: number) {
		const parts = this.navigationDate.with({ hour }).formatToParts({ hour: '2-digit', hourCycle: this.hourCycle })
		const dayPeriod = parts.find(part => part.type === 'dayPeriod')?.value
		return html`${parts.find(part => part.type === 'hour')?.value}${!dayPeriod ? html.nothing : html` <small>${dayPeriod}</small>`}`
	}

	static override get styles() {
		return css`
			${super.styles}

			mo-selectable-list-item {
				white-space: nowrap;
			}

			small {
				font-size: 0.65em;
				opacity: 0.7;
			}
		`
	}

	protected override get listItemsTemplate() {
		return html`
			${[...range(0, this.navigationDate.hoursInDay)].map(hour => html`
				<mo-selectable-list-item
					?selected=${this.value?.hour === hour}
					?data-navigating=${this.navigationDate.hour === hour}
					@navigate=${() => this.navigate.dispatch(this.navigationDate.with({ hour }))}
					@change=${(e: SelectionListItemChangeEvent<void>) => !e.selected ? void 0 : this.change.dispatch((this.value ?? new DateTime).with({ hour }))}
				>${this.labelTemplate(hour)}</mo-selectable-list-item>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-hour-list': HourList
	}
}