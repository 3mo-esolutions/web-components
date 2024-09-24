import { component, html, property, queryAll } from '@a11d/lit'
import { FieldSelect } from '@3mo/select-field'
import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', {
	'Year': 'Jahr',
})

@component('mo-field-year')
export class FieldSelectYear extends FieldSelect<number> {
	@property({ type: Object }) navigatingDate!: DateTime

	@queryAll('mo-option') readonly optionsNodes!: Array<HTMLElement>

	private get activeYearNode() {
		return this.optionsNodes.find(o => o.hasAttribute('selected')) ?? this.optionsNodes.at(-1)
	}

	@property({
		type: Boolean,
		reflect: true,
		updated(this: FieldSelectYear, isOpen: boolean) {
			if (isOpen) {
				requestAnimationFrame(() => this.activeYearNode?.scrollIntoView())
			}
		}
	}) override open = false

	override readonly label = t('Year')
	override readonly searchable = true

	private readonly currentYear = new DateTime().year

	private years = new Array(150)
		.fill(undefined)
		.map((_, i) => this.currentYear - 100 + i)

	protected override get optionsTemplate() {
		return html`
			${this.years.map(year => html`
				<mo-option value=${year}>
					${year.format()}
				</mo-option>
			`)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-field-year': FieldSelectYear
	}
}