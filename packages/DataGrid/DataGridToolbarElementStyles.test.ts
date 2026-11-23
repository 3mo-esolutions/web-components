import { component, css, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/date-time-fields'
import '@3mo/field-pair'
import '@3mo/text-fields'
import { DataGridToolbarElementStyles } from './DataGridToolbarElementStyles.js'
import { DataGrid } from './index.js'

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

	describe('with a date range in the toolbar', () => {
		const fixture = new ComponentTestFixture<HTMLElementTagNameMap['mo-data-grid']>(html`
			<mo-data-grid style='width: 1200px' .data=${[]}>
				<mo-field-date-range slot='toolbar' label='Period' .value=${new DateTimeRange(new DateTime(2026, 10, 23), new DateTime(2026, 11, 31))}></mo-field-date-range>
			</mo-data-grid>
		`)

		it('should show the whole range rather than cut it off at the convention\'s maximum width', async () => {
			const field = fixture.component.querySelector('mo-field-date-range')!
			await field.updateComplete
			const range = field.renderRoot.querySelector<HTMLElement>('[part=segments-range]')!

			await vi.waitFor(() => expect(range.scrollWidth).toBeGreaterThan(0))
			expect(range.scrollWidth).toBeLessThanOrEqual(range.clientWidth)
		})
	})

	describe('with a date range in a field pair narrower than the range', () => {
		@component('test-data-grid-toolbar-element-styles')
		class TestDataGrid extends DataGrid<unknown> {
			override get toolbarDefaultTemplate() {
				return html`
					<mo-field-pair style='width: 300px; --mo-field-pair-attachment-width: 140px'>
						<mo-field-date-range label='Period' .value=${new DateTimeRange(new DateTime(2026, 10, 23), new DateTime(2026, 11, 31))}></mo-field-date-range>
						<mo-field-text slot='attachment' label='By'></mo-field-text>
					</mo-field-pair>
				`
			}
		}

		const fixture = new ComponentTestFixture(() => new TestDataGrid())

		it('should stay within the pair', async () => {
			const pair = fixture.component.renderRoot.querySelector('mo-field-pair')!
			const field = pair.querySelector('mo-field-date-range')!
			await field.updateComplete

			expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(pair.getBoundingClientRect().right)
		})
	})
})
