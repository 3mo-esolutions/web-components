import { HTMLTemplateResult, html, live, query } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { FieldComponent } from './FieldComponent.js'

class TestFieldComponent extends FieldComponent<string> {
	value = ''

	protected get inputTemplate(): HTMLTemplateResult {
		return html`
			<input
				.value=${live(this.inputValue || '')}
				@input=${(e: CustomEvent<string>) => this.handleInput(e.detail, e)}
				@change=${(e: CustomEvent<string>) => this.handleChange(e.detail, e)}
			/>
		`
	}

	@query('input') protected readonly inputElement!: HTMLInputElement

	setCustomValidity(error: string) {
		this.inputElement.setCustomValidity(error)
	}

	async checkValidity() {
		await this.updateComplete
		return this.inputElement.checkValidity()
	}

	reportValidity() {
		return this.inputElement.reportValidity()
	}
}

customElements.define('test-field-component', TestFieldComponent)

describe('FieldComponent', () => {
	const fixture = new ComponentTestFixture<TestFieldComponent>(html`
		<test-field-component></test-field-component>
	`)

	it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
	it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
})

export async function expectSlotRendersOnlyWithAssignedContent(fixture: ComponentTestFixture<FieldComponent<unknown>>, slotName: string) {
	expect(fixture.component.renderRoot.querySelector(`slot[name="${slotName}"]`)).toBeNull()

	const slot = document.createElement('div')
	slot.slot = slotName
	fixture.component.append(slot)
	await fixture.update()

	expect(fixture.component.renderRoot.querySelector(`slot[name="${slotName}"]`)).not.toBeNull()
	slot.remove()
}