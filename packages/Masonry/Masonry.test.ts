import { html } from '@a11d/lit'
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

	describe('grid fallback', () => {
		const laidOutFixture = new ComponentTestFixture<Masonry>(html`
			<mo-masonry style='width: 300px; height: 200px'>
				<div id='item-0' style='width: 50px; height: 50px'></div>
				<div id='item-1' style='width: 50px; height: 50px'></div>
				<div id='item-2' style='width: 50px; height: 50px'></div>
				<div id='item-3' style='width: 50px; height: 50px'></div>
			</mo-masonry>
		`)

		const rect = (index: number) => laidOutFixture.component.querySelector(`#item-${index}`)!.getBoundingClientRect()

		const guarded = Masonry.supported ? xit : it

		guarded('should align items in rows across the defined column lanes', async () => {
			laidOutFixture.component.columns = 3

			await laidOutFixture.updateComplete

			expect(rect(1).left).toBeGreaterThan(rect(0).left)
			expect(rect(3).top).toBeGreaterThanOrEqual(rect(0).bottom)
			expect(rect(3).left).toBe(rect(0).left)
		})

		guarded('should flow a horizontal masonry sideways', async () => {
			laidOutFixture.component.rows = 2

			await laidOutFixture.updateComplete

			expect(laidOutFixture.component.hasAttribute('horizontal')).toBeTrue()
			expect(rect(1).top).toBeGreaterThanOrEqual(rect(0).bottom)
			expect(rect(2).left).toBeGreaterThanOrEqual(rect(0).right)
			expect(rect(2).top).toBe(rect(0).top)
		})
	})

	describe('native packing', () => {
		const packedFixture = new ComponentTestFixture<Masonry>(html`
			<mo-masonry columns='2' style='width: 200px'>
				<div id='item-0' style='height: 100px'></div>
				<div id='item-1' style='height: 20px'></div>
				<div id='item-2' style='height: 20px'></div>
			</mo-masonry>
		`)

		const rect = (index: number) => packedFixture.component.querySelector(`#item-${index}`)!.getBoundingClientRect()

		const guarded = Masonry.supported ? it : xit

		guarded('should pack a short item into the shortest lane instead of its natural row', async () => {
			await packedFixture.updateComplete

			expect(rect(2).left).toBe(rect(1).left)
			expect(rect(2).top).toBeLessThan(rect(0).bottom)
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