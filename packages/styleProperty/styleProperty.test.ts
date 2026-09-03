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
		@styleProperty({ styleKey: '--custom-property' }) withCustomProperty?: string
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

	it('should handle property with custom CSS property as style key', () => {
		spyOn(fixture.component, 'requestUpdate')

		fixture.component.withCustomProperty = '10px'

		expect(fixture.component.style.getPropertyValue('--custom-property')).toBe('10px')
		expect(fixture.component.withCustomProperty).toBe('10px')
		expect(fixture.component.requestUpdate).toHaveBeenCalledOnceWith('withCustomProperty', '')
	})

	it('should read back a style set directly on the element, as the property holds no state of its own', () => {
		fixture.component.style.gap = '20px'
		fixture.component.style.alignItems = 'flex-end'
		fixture.component.style.width = '100%'
		fixture.component.style.setProperty('--custom-property', '30px')

		expect(fixture.component.gap).toBe('20px')
		expect(fixture.component.withCustomKey).toBe('flex-end')
		// The converter maps the style value back into the property's own vocabulary.
		expect(fixture.component.withCustomConverter).toBe('*')
		expect(fixture.component.withCustomProperty).toBe('30px')
	})
})