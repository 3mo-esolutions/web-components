import { component, html, property, queryAll } from '@a11d/lit'
import { FieldSelect } from '@3mo/select-field'
import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', {
	'Month': 'Monat',
})

@component('mo-field-month')
export class FieldSelectMonth extends FieldSelect<string> {
	@property({ type: Object }) navigatingDate!: DateTime

	@queryAll('mo-option') readonly optionsNodes!: Array<HTMLElement>

	private get selectedMonthNode() {
		return this.optionsNodes.find(o => o.hasAttribute('selected'))
	}

	@property({
		type: Boolean,
		reflect: true,
		updated(this: FieldSelectMonth, isOpen: boolean) {
			if (isOpen) {
				requestAnimationFrame(() => this.selectedMonthNode?.scrollIntoView())
			}
		}
	}) override open = false

	override readonly label = t('Month')
	override readonly searchable = true

	private get monthNames() {
		return new Array(this.navigatingDate.monthsInYear)
			.fill(undefined)
			.map((_, i) => this.navigatingDate.yearStart.add({ months: i }))
			.map(date => [date.month - 1, date.format({ month: 'long' })] as const)
	}

	protected override get optionsTemplate() {
		return html`
			${this.monthNames.map(([month, name]) => html`
				<mo-option value=${month}>
					${name}
				</mo-option>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-month': FieldSelectMonth
	}
}