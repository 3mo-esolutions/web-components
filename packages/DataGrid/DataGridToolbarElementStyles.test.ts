import { css } from '@a11d/lit'
import { DataGridToolbarElementStyles } from './DataGridToolbarElementStyles.js'

describe('DataGridToolbarElementStyles', () => {
	const cssTextOf = (styles: DataGridToolbarElementStyles) => [...styles.styleSheet!.cssRules]
		.map(rule => rule.cssText)
		.join('\n')
		.replace(/\s+/g, ' ')

	it('should register the size conventions of the field components it ships with', () => {
		const cssText = cssTextOf(new DataGridToolbarElementStyles())

		expect(cssText).toContain('mo-field-search')
		expect(cssText).toContain('max-width: 20rem')
	})

	it('should size slotted toolbar and filter elements by their registered convention', () => {
		const styles = new DataGridToolbarElementStyles()

		styles.set('custom-element', css`width: 200px;`)

		const rule = [...styles.styleSheet!.cssRules].find(rule => rule.cssText.includes('custom-element'))!
		expect(rule.cssText.replace(/\s+/g, ' ')).toContain('width: 200px')
		expect(rule.cssText).toContain('slotted')
		expect(rule.cssText).toContain('toolbar')
		expect(rule.cssText).toContain('filter')
	})

	it('should size default slot content of subclassed grids as well, as both forms share the selector', () => {
		const styles = new DataGridToolbarElementStyles()

		styles.set('.sub-element', css`height: 50px;`)

		const selectorText = ([...styles.styleSheet!.cssRules]
			.find(rule => rule.cssText.includes('.sub-element')) as CSSStyleRule)
			.selectorText
		const selectors = selectorText.split(',')

		expect(selectors.some(selector => selector.includes('slotted'))).toBe(true)
		expect(selectors.some(selector => !selector.includes('slotted'))).toBe(true)
	})

	it('should apply a convention registered after the grid connected, as the sheet is shared by reference', () => {
		const styles = new DataGridToolbarElementStyles()
		const sheet = styles.styleSheet

		styles.set('late-registered', css`display: flex;`)

		expect(styles.styleSheet).toBe(sheet)
		expect(cssTextOf(styles)).toContain('late-registered')
	})

	it('should replace an existing convention for the same selector instead of accumulating', () => {
		const styles = new DataGridToolbarElementStyles()
		styles.set('test-selector', css`color: red;`)
		const ruleCount = styles.styleSheet!.cssRules.length

		styles.set('test-selector', css`color: blue;`)

		expect(styles.styleSheet!.cssRules.length).toBe(ruleCount)
		expect(cssTextOf(styles)).toContain('color: blue')
		expect(cssTextOf(styles)).not.toContain('color: red')
	})
})