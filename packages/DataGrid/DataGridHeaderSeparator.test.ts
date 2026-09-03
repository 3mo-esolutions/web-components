import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { Localizer } from '@3mo/localization'
import './index.js'
import { type DataGrid } from './DataGrid.js'
import { type DataGridHeaderSeparator } from './DataGridHeaderSeparator.js'

type Person = { id: number, name: string, age: number }

describe('DataGridHeaderSeparator', () => {
	const fixture = new ComponentTestFixture<DataGrid<Person>>(html`
		<mo-data-grid .data=${[{ id: 1, name: 'Alice', age: 30 }]}>
			<mo-data-grid-column-text heading='Name' dataSelector='name'></mo-data-grid-column-text>
			<mo-data-grid-column-number heading='Age' dataSelector='age'></mo-data-grid-column-number>
		</mo-data-grid>
	`)

	const language = Localizer.languages.current
	afterEach(() => Localizer.languages.current = language)

	const initialWidthInPixels = 100

	const getSeparator = async () => {
		await fixture.updateComplete
		await new Promise(r => setTimeout(r, 30))
		fixture.component.columnsController.setWidthInPixels('name', initialWidthInPixels)
		const header = fixture.component.renderRoot.querySelector('mo-data-grid-header')!
		header.requestUpdate()
		await header.updateComplete
		const columnHeader = header.renderRoot.querySelector('mo-data-grid-column-header')!
		columnHeader.requestUpdate()
		await columnHeader.updateComplete
		const separator = columnHeader.renderRoot.querySelector('mo-data-grid-header-separator') as DataGridHeaderSeparator
		await separator.updateComplete
		return separator
	}

	const handleOf = (separator: DataGridHeaderSeparator) => separator.renderRoot.querySelector('.separator')!

	const modifiedWidth = () => fixture.component.columnsController.columns.modifications.get('name')?.width

	const drag = (separator: DataGridHeaderSeparator, from: number, to: number) => {
		handleOf(separator).dispatchEvent(new PointerEvent('pointerdown', { clientX: from, bubbles: true }))
		window.dispatchEvent(new PointerEvent('pointermove', { clientX: to }))
		window.dispatchEvent(new PointerEvent('pointerup', { clientX: to }))
	}

	describe('Resizing', () => {
		it('should apply the dragged width as a column width modification on pointer-up', async () => {
			const separator = await getSeparator()
			const { left } = separator.getBoundingClientRect()

			drag(separator, left, left + 50)

			expect(parseFloat(modifiedWidth() as string)).toBeCloseTo(initialWidthInPixels + 50, 3)
			expect(modifiedWidth()).toContain('px')
			expect(fixture.component.columns.find(c => c.dataSelector === 'name')?.width).toBe(modifiedWidth())
		})

		it('should clamp the width to the 30px minimum', async () => {
			const separator = await getSeparator()
			const { left } = separator.getBoundingClientRect()

			drag(separator, left, left - 500)

			expect(modifiedWidth()).toBe('30px')
		})

		it('should ignore pointer-moves without an active resize, as the listeners are global', async () => {
			await getSeparator()

			window.dispatchEvent(new PointerEvent('pointermove', { clientX: 500 }))
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 500 }))

			expect(modifiedWidth()).toBeUndefined()
		})

		it('should not apply a width when the pointer never moved', async () => {
			const separator = await getSeparator()

			handleOf(separator).dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, bubbles: true }))
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 10 }))

			expect(modifiedWidth()).toBeUndefined()
		})

		it('should measure from the inline-start edge in RTL', async () => {
			Localizer.languages.current = 'fa'
			const separator = await getSeparator()
			const { right } = separator.getBoundingClientRect()

			drag(separator, window.innerWidth - right, window.innerWidth - right - 50)

			expect(parseFloat(modifiedWidth() as string)).toBeCloseTo(initialWidthInPixels + 50, 3)
		})
	})

	describe('Double-click', () => {
		it('should reset the column width to max-content', async () => {
			const separator = await getSeparator()
			drag(separator, 0, 200)
			expect(modifiedWidth()).not.toBe('max-content')

			handleOf(await getSeparator()).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))

			expect(modifiedWidth()).toBe('max-content')
			expect(fixture.component.columns.find(c => c.dataSelector === 'name')?.width).toBe('max-content')
		})
	})
})