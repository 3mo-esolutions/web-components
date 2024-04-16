import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Checkbox } from './Checkbox.js'
import { html } from '@a11d/lit'

class CheckboxTestFixture extends ComponentTestFixture<Checkbox> {
	get mdCheckbox() {
		return this.component.renderRoot.querySelector('md-checkbox') ?? undefined
	}

	expectNotSelected() {
		expect(this.component.selected).toBe(false)
		expect(this.mdCheckbox?.indeterminate).toBe(false)
		expect(this.mdCheckbox?.checked).toBe(false)
	}

	expectSelected() {
		expect(this.component.selected).toBe(true)
		expect(this.mdCheckbox?.indeterminate).toBe(false)
		expect(this.mdCheckbox?.checked).toBe(true)
	}

	expectIndeterminate() {
		expect(this.component.selected).toBe('indeterminate')
		expect(this.mdCheckbox?.indeterminate).toBe(true)
		expect(this.mdCheckbox?.checked).toBe(false)
	}
}

describe('Checkbox', () => {
	describe('disabled', () => {
		const fixture = new CheckboxTestFixture(html`<mo-checkbox disabled></mo-checkbox>`)

		it('should tunnel the disabled attribute to md-checkbox', () => {
			expect(fixture.mdCheckbox?.disabled).toBe(true)
		})

		it('should set pointer-events to "none" when disabled', async () => {
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')

			fixture.component.disabled = false
			await fixture.component.updateComplete

			expect(getComputedStyle(fixture.component).pointerEvents).toBe('auto')
		})
	})

	describe('selection', () => {
		describe('via selection property', () => {
			describe('true', () => {
				const fixtureHtml = new CheckboxTestFixture(html`<mo-checkbox selected></mo-checkbox>`)
				it('should handle html binding', () => fixtureHtml.expectSelected())

				const fixtureLitBoolean = new CheckboxTestFixture(html`<mo-checkbox ?selected=${true}></mo-checkbox>`)
				it('should handle boolean binding', () => fixtureLitBoolean.expectSelected())

				const fixtureLitProperty = new CheckboxTestFixture(html`<mo-checkbox .selected=${true}></mo-checkbox>`)
				it('should handle property binding', () => fixtureLitProperty.expectSelected())
			})

			describe('false', () => {
				const fixtureHtml = new CheckboxTestFixture(html`<mo-checkbox></mo-checkbox>`)
				it('should handle html binding', () => fixtureHtml.expectNotSelected())

				const fixtureLitBoolean = new CheckboxTestFixture(html`<mo-checkbox ?selected=${false}></mo-checkbox>`)
				it('should handle boolean binding', () => fixtureLitBoolean.expectNotSelected())

				const fixtureLitProperty = new CheckboxTestFixture(html`<mo-checkbox .selected=${false}></mo-checkbox>`)
				it('should handle property binding', () => fixtureLitProperty.expectNotSelected())
			})

			describe('indeterminate', () => {
				const fixtureHtml = new CheckboxTestFixture(html`<mo-checkbox selected='indeterminate'></mo-checkbox>`)
				it('should handle html binding', () => fixtureHtml.expectIndeterminate())

				const fixtureLitProperty = new CheckboxTestFixture(html`<mo-checkbox .selected=${'indeterminate'}></mo-checkbox>`)
				it('should handle property binding', () => fixtureLitProperty.expectIndeterminate())
			})
		})

		describe('change event', () => {
			const fixture = new CheckboxTestFixture(html`<mo-checkbox></mo-checkbox>`)

			describe('via md-checkbox', () => {
				it('true', async () => {
					spyOn(fixture.component.change, 'dispatch')

					fixture.mdCheckbox!.checked = true
					fixture.mdCheckbox!.indeterminate = false
					fixture.mdCheckbox?.dispatchEvent(new Event('change'))

					await fixture.component.updateComplete
					fixture.expectSelected()
					expect(fixture.component.change.dispatch).toHaveBeenCalledWith(true)
				})

				it('false', async () => {
					spyOn(fixture.component.change, 'dispatch')

					fixture.mdCheckbox!.checked = false
					fixture.mdCheckbox!.indeterminate = false
					fixture.mdCheckbox?.dispatchEvent(new Event('change'))

					await fixture.component.updateComplete
					fixture.expectNotSelected()
					expect(fixture.component.change.dispatch).toHaveBeenCalledWith(false)
				})

				it('indeterminate', async () => {
					spyOn(fixture.component.change, 'dispatch')

					fixture.mdCheckbox!.checked = false
					fixture.mdCheckbox!.indeterminate = true
					fixture.mdCheckbox?.dispatchEvent(new Event('change'))

					await fixture.component.updateComplete
					fixture.expectIndeterminate()
					expect(fixture.component.change.dispatch).toHaveBeenCalledWith('indeterminate')
				})
			})
		})
	})
})