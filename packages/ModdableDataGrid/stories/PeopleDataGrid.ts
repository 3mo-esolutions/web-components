import { component, html } from '@a11d/lit'
import { ModdableDataGrid } from '@3mo/moddable-data-grid'
import { people, respond, type Person } from '../../../stories/index.js'

export type PeopleParameters = {
	readonly keyword?: string
	readonly city?: string
	readonly birthDate?: DateTimeRange
}

/** A grid of people whose views save a search, a city and a range of birth dates besides the columns and sorting. */
@component('story-people-data-grid')
export class PeopleDataGrid extends ModdableDataGrid<Person, PeopleParameters> {
	private static readonly cities = [...new Set(people.map(person => person.city))].sort()

	override parameters: PeopleParameters = {}

	override fetch = ({ keyword, city, birthDate }: PeopleParameters) => respond(people.filter(person =>
		(!keyword || person.name.toLowerCase().includes(keyword.toLowerCase()))
		&& (!city || person.city === city)
		&& (!birthDate || birthDate.includes(person.birthDate))
	), 250)

	override get hasToolbar() {
		return true
	}

	override get toolbarDefaultTemplate() {
		const { bind } = this.parametersBinder
		return html`
			<mo-field-search style='min-width: 180px' ${bind('keyword')}></mo-field-search>
			<mo-field-select label='City' style='min-width: 140px' ${bind('city')}>
				<mo-option value=''>All</mo-option>
				${PeopleDataGrid.cities.map(city => html`<mo-option value=${city}>${city}</mo-option>`)}
			</mo-field-select>
			<mo-field-date-range label='Birth Date' style='min-width: 220px' ${bind('birthDate')}></mo-field-date-range>
		`
	}

	override get columnsTemplate() {
		return html`
			<mo-data-grid-column-number heading='ID' dataSelector='id' width='60px'></mo-data-grid-column-number>
			<mo-data-grid-column-text heading='Name' dataSelector='name' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='Occupation' dataSelector='occupation' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-text heading='City' dataSelector='city' width='1fr'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age' width='80px'></mo-data-grid-column-number>
			<mo-data-grid-column-date heading='Birth Date' dataSelector='birthDate' width='140px'></mo-data-grid-column-date>
		`
	}
}