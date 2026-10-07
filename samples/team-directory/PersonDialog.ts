import { component, DialogComponent, html } from '@3mo/del'
import type { Person } from '../../stories/index.js'

/** A person's profile. */
@component('recipe-person-dialog')
export class PersonDialog extends DialogComponent<{ readonly person: Person }> {
	protected override get template() {
		const { name, occupation, email, phone, address, birthDate, age } = this.parameters.person
		return html`
			<mo-dialog heading=${name} size='small'>
				<mo-key-value-list alwaysStacked>
					<mo-key-value key='Job' value=${occupation}></mo-key-value>
					<mo-key-value key='Email'>
						<mo-anchor href='mailto:${email}'>${email}</mo-anchor>
					</mo-key-value>
					<mo-key-value key='Phone'>
						<mo-anchor href='tel:${phone.replaceAll(' ', '')}'>${phone}</mo-anchor>
					</mo-key-value>
					<mo-key-value key='Address' value=${address}></mo-key-value>
					<mo-key-value key='Birthday' value=${`${birthDate.format({ dateStyle: 'long' })} (${age})`}></mo-key-value>
				</mo-key-value-list>
			</mo-dialog>
		`
	}
}
