import { component, css, html, property } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { Localizer } from '@3mo/localization'
import { FieldDateTimeBase } from '../date-time/FieldDateTimeBase.js'
import { FieldDateTimeRangeController, type FieldDateTimeRangeSelection } from './FieldDateTimeRangeController.js'

Localizer.dictionaries.add('de', {
	'Period': 'Zeitraum',
	'Start': 'Start',
	'End': 'Ende',
})

/**
 * A date and time range field, with segments for each end and a picker that edits one end at a time.
 *
 * Its behaviour is {@link FieldDateTimeRangeController}, for a date range field of another design.
 *
 * @element mo-field-date-time-range
 *
 * @attr value - The selected date range.
 *
 * @csspart segments-range - Both ends' segments and the delimiter between them
 *
 * @i18n "Period"
 * @i18n "Start"
 * @i18n "End"
 * @i18n "Last ${count:number} days"
 * @i18n "Last week"
 * @i18n "This week"
 * @i18n "Next week"
 * @i18n "Last month"
 * @i18n "This month"
 * @i18n "Next month"
 * @i18n "Last year"
 * @i18n "This year"
 * @i18n "Next year"
 *
 * @accessibility
 * The segments follow the [segmented input](?path=/docs/behaviors-segmented-input--overview): a `group` named after the `label`, with one `spinbutton` per part, and one tab stop for the group. `aria-invalid`, `aria-required` and `aria-readonly` follow the field.
 * `Alt` `ArrowDown` opens the picker. The picker's calendar cannot be operated with the keyboard yet, so the segments are the keyboard's way in.
 */
@component('mo-field-date-time-range')
export class FieldDateTimeRange extends FieldDateTimeBase<DateTimeRange | undefined> {
	@property({ type: Object }) value?: DateTimeRange

	readonly controller = new FieldDateTimeRangeController(this, this.controllerOptions)

	protected get segmentsTemplate() {
		return html`
			<div part='segments-range' dir=${this.controller.startSegments.segmenter.direction}>
				${this.getSegmentsTemplate(this.controller.startSegments, 'start')}
				<span part='literal' aria-hidden='true'> ${DateTimeRange.getUntilDelimiter()} </span>
				${this.getSegmentsTemplate(this.controller.endSegments, 'end')}
			</div>
		`
	}

	protected override get _label() {
		return super._label || t('Period')
	}

	static override get styles() {
		return css`
			${super.styles}

			mo-tab-bar {
				max-width: 200px;
				place-self: center;
				padding-block: 4px;
				mo-tab {
					&:not([active]) {
						opacity: 0.5;
					}
				}
			}

			#selector {
				flex: none !important;
			}
		`
	}

	protected override calendarIconButtonIcon: MaterialIcon = 'date_range'

	protected override get popoverSelectionTemplate() {
		return html`
			<mo-flex style='flex: 1'>
				${this.popoverToolbarTemplate}
				${super.popoverSelectionTemplate}
			</mo-flex>
		`
	}

	protected get popoverToolbarTemplate() {
		return html`
			${this.startEndTabBarTemplate}
		`
	}

	private get startEndTabBarTemplate() {
		return html`
			<mo-flex style='border-inline-start: 1px solid var(--mo-color-transparent-gray-3)'>
				<mo-tab-bar .value=${this.controller.selection} @change=${(e: CustomEvent<FieldDateTimeRangeSelection>) => this.controller.selection = e.detail}>
					<mo-tab value='start'>${t('Start')}</mo-tab>
					<mo-tab value='end'>${t('End')}</mo-tab>
				</mo-tab-bar>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-date-time-range': FieldDateTimeRange
	}
}