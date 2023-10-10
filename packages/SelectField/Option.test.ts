import { ComponentTestFixture } from '@a11d/lit-testing'
import { Option } from './Option.js'

describe('Option', () => {
	const fixture = new ComponentTestFixture(() => new Option())

	it('should not toggle when clicked in single mode', async () => {
		expect(fixture.component.selected).toBeFalse()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBeTrue()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		await fixture.component.updateComplete
		expect(fixture.component.selected).toBeTrue()
	})

	it('should toggle when clicked in multiple mode', () => {
		fixture.component.multiple = true
		expect(fixture.component.selected).toBeFalse()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBeTrue()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBeFalse()
	})
})