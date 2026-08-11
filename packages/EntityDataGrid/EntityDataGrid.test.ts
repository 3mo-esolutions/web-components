import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { EntityDataGrid } from './index.js'

type Person = { id: number, name: string }

describe('EntityDataGrid', () => {
	describe('Primary Action', () => {
		const fixture = new ComponentTestFixture<EntityDataGrid<Person>>(html`
			<mo-entity-data-grid .fetch=${() => Promise.resolve([{ id: 1, name: 'John' }])}></mo-entity-data-grid>
		`)

		const getCreateButton = () => fixture.component.renderRoot.querySelector('mo-loading-button')

		it('should not have a primary action without a "create" action', () => {
			expect(fixture.component).toBeInstanceOf(EntityDataGrid)
			expect(fixture.component.hasPrimaryAction).toBeFalse()
			expect(fixture.component.renderRoot.querySelector('#toolbar')).toBeNull()
		})

		// Regression: the generated create button is contributed via "primaryActionsTemplate" rather than
		// the slot's default content, so "hasPrimaryAction" did not detect it - hiding the whole toolbar
		// including the create and refetch buttons for grids without any other toolbar content.
		it('should render the toolbar with the generated create button once a "create" action is set', async () => {
			fixture.component.create = () => Promise.resolve()
			await fixture.updateComplete

			expect(fixture.component.hasPrimaryAction).toBeTrue()
			expect(fixture.component.renderRoot.querySelector('#toolbar')).not.toBeNull()
			expect(getCreateButton()?.checkVisibility()).toBeTrue()
		})

		it('should hide the generated create button when "createHidden"', async () => {
			fixture.component.create = () => Promise.resolve()
			fixture.component.createHidden = true
			await fixture.updateComplete

			expect(fixture.component.hasPrimaryAction).toBeFalse()
			expect(getCreateButton()).toBeNull()
		})

		it('should keep rendering the generated create button alongside slotted primary actions', async () => {
			fixture.component.create = () => Promise.resolve()
			const slotted = document.createElement('button')
			slotted.slot = 'primary-action'
			fixture.component.appendChild(slotted)
			await fixture.updateComplete

			const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>('slot[name=primary-action]')
			expect(slot?.assignedElements()).toEqual([slotted])
			expect(getCreateButton()?.checkVisibility()).toBeTrue()

			slotted.remove()
		})
	})
})