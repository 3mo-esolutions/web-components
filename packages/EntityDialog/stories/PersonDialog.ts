import { component, html } from '@a11d/lit'
import { EntityDialogComponent } from '@3mo/entity-dialog'
import { Person } from './Person.js'

/** Creates, edits and deletes a person. */
@component('story-person-dialog')
export class PersonDialog extends EntityDialogComponent<Person> {
	protected override entity = new Person()
	protected override fetch = Person.get
	protected override save = Person.save
	protected override delete = Person.delete

	protected override get template() {
		const { bind } = this.entityBinder
		return html`
			<mo-entity-dialog>
				<mo-flex gap='16px' style='width: 320px'>
					<mo-field-text label='Name' required ${bind('name')}></mo-field-text>
					<mo-field-number label='Age' ${bind('age')}></mo-field-number>
					<mo-field-text label='City' ${bind('city')}></mo-field-text>
				</mo-flex>
			</mo-entity-dialog>
		`
	}
}
