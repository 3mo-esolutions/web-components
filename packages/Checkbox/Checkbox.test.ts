import { ComponentTestFixture } from '@a11d/lit-testing'
import { Checkbox } from './Checkbox.js'
import { html } from '@a11d/lit'

describe('Checkbox', () => {
	const fixture = new ComponentTestFixture<Checkbox>('mo-checkbox')

	it('should set pointer-events to "none" when disabled', async () => {
		fixture.component.disabled = true
		await fixture.updateComplete
		expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
	})

	describe('selected', () => {
		describe('true', () => {
			const fixtureHtml = new ComponentTestFixture<Checkbox>(html`<mo-checkbox selected></mo-checkbox>`)
			it('should handle html binding', () => expect(fixtureHtml.component.selected).toBe(true))

			const fixtureLitBoolean = new ComponentTestFixture<Checkbox>(html`<mo-checkbox ?selected=${true}></mo-checkbox>`)
			it('should handle boolean binding', () => expect(fixtureLitBoolean.component.selected).toBe(true))

			const fixtureLitProperty = new ComponentTestFixture<Checkbox>(html`<mo-checkbox .selected=${true}></mo-checkbox>`)
			it('should handle property binding', () => expect(fixtureLitProperty.component.selected).toBe(true))
		})

		describe('false', () => {
			const fixtureHtml = new ComponentTestFixture<Checkbox>(html`<mo-checkbox></mo-checkbox>`)
			it('should handle html binding', () => expect(fixtureHtml.component.selected).toBe(false))

			const fixtureLitBoolean = new ComponentTestFixture<Checkbox>(html`<mo-checkbox ?selected=${false}></mo-checkbox>`)
			it('should handle boolean binding', () => expect(fixtureLitBoolean.component.selected).toBe(false))

			const fixtureLitProperty = new ComponentTestFixture<Checkbox>(html`<mo-checkbox .selected=${false}></mo-checkbox>`)
			it('should handle property binding', () => expect(fixtureLitProperty.component.selected).toBe(false))
		})

		describe('indeterminate', () => {
			const fixtureHtml = new ComponentTestFixture<Checkbox>(html`<mo-checkbox selected="indeterminate"></mo-checkbox>`)
			it('should handle html binding', () => expect(fixtureHtml.component.selected).toBe('indeterminate'))

			const fixtureLitProperty = new ComponentTestFixture<Checkbox>(html`<mo-checkbox .selected=${'indeterminate'}></mo-checkbox>`)
			it('should handle property binding', () => expect(fixtureLitProperty.component.selected).toBe('indeterminate'))
		})
	})
})