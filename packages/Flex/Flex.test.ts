import { ComponentTestFixture } from '@a11d/lit/dist/test/index.js'
import { Flex } from './Flex.js'

describe(Flex.name, () => {
	const fixture = new ComponentTestFixture(() => document.createElement('mo-flex'))

	const setPropertyValue = (propertyName: string, value: string) => {
		// @ts-ignore - "property" won't be a key of readonly property
		fixture.component[propertyName] = value
	}

	it('should have a default slot', () => {
		expect(fixture.component.renderRoot.querySelector('slot:not([name])')).not.toBeFalsy()
	})

	it('should have a default root display of "flex"', () => {
		expect(getComputedStyle(fixture.component).display).toBe('flex')
	})

	it('should have a default root flex-wrap of "nowrap"', () => {
		expect(getComputedStyle(fixture.component).flexWrap).toBe('nowrap')
	})

	it('should have a default root flex-direction of "column"', () => {
		expect(getComputedStyle(fixture.component).flexDirection).toBe('column')
	})

	describe('Property "direction"', () => {
		const flexDirectionByDirection = new Map<Flex['direction'], string>([
			['horizontal', 'row'],
			['horizontal-reversed', 'row-reverse'],
			['vertical', 'column'],
			['vertical-reversed', 'column-reverse'],
		])

		for (const [direction, flexDirection] of flexDirectionByDirection) {
			it('should get from CSS property "flex-direction"', () => {
				fixture.component.style.flexDirection = flexDirection
				expect(fixture.component.direction).toBe(direction)
			})

			it('should set CSS property "flex-direction"', () => {
				setPropertyValue('direction', direction)
				expect(fixture.component.style.flexDirection).toBe(flexDirection)
			})
		}
	})

	const cssPropertiesByProperty = new Map<keyof Flex, string>([
		['wrap', 'flex-wrap'],
		['gap', 'gap'],
		['justifyItems', 'justify-items'],
		['justifyContent', 'justify-content'],
		['alignItems', 'align-items'],
		['alignContent', 'align-content'],
	])

	for (const [property, cssProperty] of cssPropertiesByProperty) {
		describe(`Property "${property}"`, () => {
			it(`should get from CSS property "${cssProperty}"`, () => {
				fixture.component.style.setProperty(cssProperty, 'initial')
				expect(fixture.component[property]).toBe('initial')
			})

			it(`should set CSS property ${cssProperty}`, () => {
				setPropertyValue(property, 'initial')
				expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('initial')
			})
		})
	}
})