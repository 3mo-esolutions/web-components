import { ComponentTestFixture } from '@a11d/lit-testing'
import { Masonry } from './Masonry.js'

describe('Masonry', () => {
	const fixture = new ComponentTestFixture<Masonry>('mo-masonry')

	it('should have a default slot', () => {
		expect(fixture.component.renderRoot.querySelector('slot:not([name])')).not.toBeFalsy()
	})

	it('should lay out as native masonry, falling back to a regular grid otherwise', () => {
		const display = getComputedStyle(fixture.component).display
		if (Masonry.supported) {
			expect(['grid-lanes', 'masonry', 'grid']).toContain(display)
		} else {
			expect(display).toBe('grid')
		}
	})

	describe('Property "columns"', () => {
		it('should get from CSS property "grid-template-columns"', () => {
			fixture.component.style.setProperty('grid-template-columns', 'initial')
			expect(fixture.component.columns).toBe('initial')
		})

		it('should set CSS property "grid-template-columns"', () => {
			fixture.component.columns = 'repeat(auto-fill, minmax(100px, 1fr))'
			expect(fixture.component.style.getPropertyValue('grid-template-columns')).toBe('repeat(auto-fill, minmax(100px, 1fr))')
		})

		it('should convert a bare lane count to equally sized lanes', () => {
			fixture.component.columns = 4
			expect(fixture.component.style.getPropertyValue('grid-template-columns')).toBe('repeat(4, 1fr)')

			fixture.component.columns = ' 12 '
			expect(fixture.component.style.getPropertyValue('grid-template-columns')).toBe('repeat(12, 1fr)')
		})
	})

	describe('Property "rows"', () => {
		it('should get from CSS property "grid-template-rows"', () => {
			fixture.component.style.setProperty('grid-template-rows', 'initial')
			expect(fixture.component.rows).toBe('initial')
		})

		it('should set CSS property "grid-template-rows"', () => {
			fixture.component.rows = 3
			expect(fixture.component.style.getPropertyValue('grid-template-rows')).toBe('repeat(3, 1fr)')
		})
	})

	describe('Masonry axis', () => {
		it('should flow horizontally when only rows define the lanes', async () => {
			fixture.component.rows = 3
			await fixture.updateComplete
			expect(fixture.component.hasAttribute('horizontal')).toBeTrue()
		})

		it('should flow vertically when columns define the lanes', async () => {
			fixture.component.columns = 4
			await fixture.updateComplete
			expect(fixture.component.hasAttribute('horizontal')).toBeFalse()
		})

		it('should flow vertically when both are defined', async () => {
			fixture.component.rows = 3
			fixture.component.columns = 4
			await fixture.updateComplete
			expect(fixture.component.hasAttribute('horizontal')).toBeFalse()
		})
	})

	const cssPropertiesByProperty = new Map<keyof Masonry & string, string>([
		['rowGap', 'row-gap'],
		['columnGap', 'column-gap'],
		['gap', 'gap'],
	])

	for (const [property, cssProperty] of cssPropertiesByProperty) {
		describe(`Property "${property}"`, () => {
			it(`should get from CSS property "${cssProperty}"`, () => {
				fixture.component.style.setProperty(cssProperty, 'initial')
				expect(fixture.component[property]).toBe('initial')
			})

			it(`should set CSS property "${cssProperty}"`, () => {
				// @ts-ignore - "property" won't be a key of readonly property
				fixture.component[property] = 'initial'
				expect(fixture.component.style.getPropertyValue(cssProperty)).toBe('initial')
			})
		})
	}

	describe('Property "tolerance"', () => {
		it('should tunnel to the "--mo-masonry-tolerance" custom property', () => {
			fixture.component.tolerance = '2rem'
			expect(fixture.component.style.getPropertyValue('--mo-masonry-tolerance')).toBe('2rem')
			expect(fixture.component.tolerance).toBe('2rem')
		})
	})
})