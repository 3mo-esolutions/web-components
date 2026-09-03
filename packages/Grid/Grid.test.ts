import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Grid } from './Grid.js'

describe('Grid', () => {
	const fixture = new ComponentTestFixture<Grid>('mo-grid')

	const setPropertyValue = (propertyName: string, value: string) => {
		// @ts-ignore - "property" won't be a key of readonly property
		fixture.component[propertyName] = value
	}

	it('should have a default slot', () => {
		expect(fixture.component.renderRoot.querySelector('slot:not([name])')).not.toBeFalsy()
	})

	it('should have a default root display of "grid"', () => {
		expect(getComputedStyle(fixture.component).display).toBe('grid')
	})

	const cssPropertiesByProperty = new Map<keyof Grid, string>([
		['rows', 'grid-template-rows'],
		['columns', 'grid-template-columns'],
		['autoRows', 'grid-auto-rows'],
		['autoColumns', 'grid-auto-columns'],
		['rowGap', 'row-gap'],
		['columnGap', 'column-gap'],
		['gap', 'gap'],
		['justifyItems', 'justify-items'],
		['justifyContent', 'justify-content'],
		['alignItems', 'align-items'],
		['alignContent', 'align-content'],
	])

	const propertiesSupportingAsterixSyntax = new Set<keyof Grid>(['rows', 'columns'])

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

			if (propertiesSupportingAsterixSyntax.has(property)) {
				it('should supports asterisk syntax', () => {
					setPropertyValue(property, '*')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('1fr')

					setPropertyValue(property, '   *  ')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('1fr')

					setPropertyValue(property, '5*')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('5fr')

					setPropertyValue(property, '  11*   ')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('11fr')
				})

				it('should convert asterisks inside a mixed track template', () => {
					setPropertyValue(property, '2* 100px *')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('2fr 100px 1fr')

					setPropertyValue(property, 'min-content 3* auto 12*')
					expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('min-content 3fr auto 12fr')
				})
			}
		})
	}

	it('should tunnel the "autoFlow" property to CSS property "grid-auto-flow"', () => {
		fixture.component.autoFlow = 'column'
		expect(fixture.component.style.getPropertyValue('grid-auto-flow')).toBe('column')

		fixture.component.style.setProperty('grid-auto-flow', 'row')
		expect(fixture.component.autoFlow).toBe('row')
	})
})