import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Option } from './Option.js'

describe('Option', () => {
	const fixture = new ComponentTestFixture(() => new Option())

	it('should not toggle when clicked in single mode', () => {
		expect(fixture.component.selected).toBeFalse()

		fixture.component.dispatchEvent(new MouseEvent('click'))
		expect(fixture.component.selected).toBeTrue()

		fixture.component.dispatchEvent(new MouseEvent('click'))
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