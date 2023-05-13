import { component, property, event } from '@a11d/lit'
import { CalendarSelectionAdapter } from './index.js'
import { Calendar } from './Calendar.js'

/** @fires change {CustomEvent<T>} */
@component('mo-selectable-calendar')
export class SelectableCalendar<T> extends Calendar {
	@event() readonly change!: EventDispatcher<T>

	@property({ type: Object }) selectionAdapterConstructor!: Constructor<CalendarSelectionAdapter<T>>
	@property({
		type: Object, updated(this: SelectableCalendar<T>) {
			this.navigatingDate = this.selectionAdapter.getNavigatingDate(this.value)
		}
	}) value?: T

	private _selectionAdapter?: CalendarSelectionAdapter<T>
	get selectionAdapter() {
		if (this._selectionAdapter) {
			return this._selectionAdapter
		}
		this._selectionAdapter = new this.selectionAdapterConstructor(this)
		SelectableCalendar.elementStyles.push(this._selectionAdapter.styles)
		return this._selectionAdapter
	}

	protected override getDayTemplate(day: DateTime) {
		return this.selectionAdapter.getDayTemplate(day, this.getDefaultDayElementClasses(day))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-selectable-calendar': SelectableCalendar<unknown>
	}
}