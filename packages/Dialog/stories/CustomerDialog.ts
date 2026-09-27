import { component, html } from '@a11d/lit'
import { type EntityId, FetchableDialogComponent } from '@3mo/fetchable-dialog'

type Customer = { id: number, name: string, email: string }

/** Fetches the customer of the given `id`, stays loading until it arrives and binds the fields to it. */
@component('story-customer-dialog')
export class CustomerDialog extends FetchableDialogComponent<Customer, { readonly id?: EntityId }, Customer> {
	protected override entity: Customer = { id: 0, name: '', email: '' }

	protected override async fetch(id: EntityId) {
		await new Promise(resolve => setTimeout(resolve, 1500))
		return { id: Number(id), name: 'Nordwind GmbH', email: 'orders@nordwind.example' }
	}

	protected override get template() {
		const { bind } = this.entityBinder
		return html`
			<mo-fetchable-dialog heading='Customer' primaryButtonText='Save' size='small'>
				<mo-flex gap='8px'>
					<mo-field-text label='Name' ${bind('name')}></mo-field-text>
					<mo-field-text label='Email' ${bind('email')}></mo-field-text>
				</mo-flex>
			</mo-fetchable-dialog>
		`
	}

	protected override async primaryAction() {
		await new Promise(resolve => setTimeout(resolve, 1000))
		return this.entity
	}
}