import { ComponentTestFixture } from '../../test/index.js'
import { Grid } from './Grid.js'

describe(Grid.name, () => {
	const fixture = new ComponentTestFixture(() => document.createElement('mo-grid'))

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
			}
		})
	}
})