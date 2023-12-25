import { component, Component } from '@a11d/lit'
import { styleProperty } from './styleProperty.js'
import { ComponentTestFixture } from '@a11d/lit-testing'

describe('styleProperty', () => {
	@component('test-style-property')
	class TestComponent extends Component {
		@styleProperty() gap?: string
		@styleProperty({ styleKey: 'alignItems' }) withCustomKey?: string
		@styleProperty({
			styleKey: 'width',
			styleConverter: {
				fromStyle: (value: string) => value === '100%' ? '*' : value,
				toStyle: (value: string) => value === '*' ? '100%' : value,
			}
		}) withCustomConverter?: string
	}

	const fixture = new ComponentTestFixture(() => new TestComponent)

	it('should handle property with same name as style key', () => {
		spyOn(fixture.component, 'requestUpdate')

		fixture.component.gap = '10px'

		expect(fixture.component.style.gap).toBe('10px')
		expect(fixture.component.gap).toBe('10px')
		expect(fixture.component.requestUpdate).toHaveBeenCalledOnceWith('gap', '')
	})

	it('should handle property with custom style key', () => {
		spyOn(fixture.component, 'requestUpdate')

		fixture.component.withCustomKey = 'center'

		expect(fixture.component.style.alignItems).toBe('center')
		expect(fixture.component.withCustomKey).toBe('center')
		expect(fixture.component.requestUpdate).toHaveBeenCalledOnceWith('withCustomKey', '')
	})

	it('should handle property with custom converter', () => {
		spyOn(fixture.component, 'requestUpdate')

		fixture.component.withCustomConverter = '*'

		expect(fixture.component.style.width).toBe('100%')
		expect(fixture.component.withCustomConverter).toBe('*')
		expect(fixture.component.requestUpdate).toHaveBeenCalledOnceWith('withCustomConverter', '')
	})
})