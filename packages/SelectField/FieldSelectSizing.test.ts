import { Component, component, css, html, render } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import type { FieldSelect } from './FieldSelect.js'
import type { Value } from './SelectValueController.js'
import './index.js'

/** Sizes to its content, so a field inside is as wide as it wants to be. */
@component('field-select-sizing-container')
class SizingContainer extends Component {
	static override get styles() {
		return css`:host { display: inline-flex }`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

SizingContainer

const sizes = ['S', 'M', 'L', 'A rather long option text']

const tick = (duration = 0) => new Promise(resolve => setTimeout(resolve, duration))

async function settle(component: FieldSelect<unknown>) {
	await component.updateComplete
	await tick(20)
	await component.updateComplete
}

const widthOf = (element: Element) => element.getBoundingClientRect().width

// The sizer's rows stretch to their cell, so only their text says how wide they want to be.
const textWidthOf = (element: Element) => {
	const range = document.createRange()
	range.selectNodeContents(element)
	return range.getBoundingClientRect().width
}

describe('FieldSelect sizing', () => {
	const fixture = new ComponentTestFixture<SizingContainer>(html`
		<field-select-sizing-container>
			<mo-field-select label='Size'>
				${sizes.map(size => html`<mo-option value=${size}>${size}</mo-option>`)}
			</mo-field-select>
		</field-select-sizing-container>
	`)

	const select = () => fixture.component.querySelector('mo-field-select')!
	const input = () => select().valueInputElement ?? select().searchInputElement!
	// The cell the sizer governs; the field's chrome around it is constant, apart from the dropdown icon's font arriving over the network.
	const cell = () => select().renderRoot.querySelector('#input-container')!
	const sizerRows = () => [...select().renderRoot.querySelectorAll('#sizer > *')] as Array<HTMLElement>
	const widestSizerText = () => Math.max(...sizerRows().map(textWidthOf))
	const width = () => widthOf(cell())

	async function selectValue(value: Value) {
		select().value = value
		await settle(select())
	}

	async function type(keyword: string) {
		select()['focusController'].focusIn()
		await settle(select())
		const input = select().searchInputElement!
		input.value = keyword
		input.dispatchEvent(new Event('input', { bubbles: true }))
		await settle(select())
	}

	beforeEach(() => settle(select()))

	afterEach(() => { select().open = false })

	it('should be as wide as its widest option, whichever option is selected', async () => {
		const initial = width()
		expect(widthOf(input())).toBeCloseTo(widestSizerText(), 1)

		for (const size of sizes) {
			await selectValue(size)
			expect(width(), size).toBe(initial)
		}
	})

	it('should be as wide as its label when that is wider than every option, and stay so once the label floats', async () => {
		select().label = 'A label that is wider than every option'
		await settle(select())
		const initial = width()
		const label = textWidthOf(select().renderRoot.querySelector('mo-field')!.renderRoot.querySelector('span')!)
		expect(label).toBeGreaterThan(widestSizerText())
		expect(initial).toBeCloseTo(label, 0)

		await selectValue('M')

		expect(width()).toBe(initial)
	})

	it('should count the default option', async () => {
		select().default = 'A default text longer than any option'
		await settle(select())

		expect(sizerRows().map(row => row.textContent)).toContain('A default text longer than any option')
		expect(widthOf(input())).toBeCloseTo(widestSizerText(), 1)
	})

	it('should keep its width as options are added to a multiple selection', async () => {
		select().multiple = true
		await settle(select())
		const initial = width()

		await selectValue(['S'])
		await selectValue(['S', 'M'])
		await selectValue(['S', 'M', 'L', 'A rather long option text'])

		expect(width()).toBe(initial)
	})

	it('should keep its width while typing a search, clear button included', async () => {
		select().searchable = true
		await settle(select())
		const initial = width()

		await type('a search string that is longer than every option and the label')

		expect(select().renderRoot.querySelector('mo-icon-button[icon=cancel]')?.closest('#input-container')).toBe(cell())
		expect(width()).toBe(initial)
	})

	it('should keep its width whichever direction it is in', async () => {
		const initial = width()

		fixture.component.dir = 'rtl'
		await settle(select())

		expect(width()).toBe(initial)
	})

	it('should keep only the longest texts when there are more options than the limit', async () => {
		const count = 1000
		const longest = 'The single longest option text of them all'
		render(Array.from({ length: count }, (_, i) => html`<mo-option value=${i}>${i === 500 ? longest : `Option ${i}`}</mo-option>`), select())
		await settle(select())
		await settle(select())

		expect(select().options.length).toBe(count + sizes.length)
		expect(sizerRows().length).toBe(20)
		expect(sizerRows().map(row => row.textContent)).toContain(longest)
		expect(widthOf(input())).toBeCloseTo(widestSizerText(), 1)
	})

	describe('in a stretching container', () => {
		const fixture = new ComponentTestFixture<SizingContainer>(html`
			<field-select-sizing-container style='display: flex; width: 320px'>
				<mo-field-select label='Size' style='flex: 1'>
					${sizes.map(size => html`<mo-option value=${size}>${size}</mo-option>`)}
				</mo-field-select>
				<mo-field-select label='Size' style='width: 100px'>
					${sizes.map(size => html`<mo-option value=${size}>${size}</mo-option>`)}
				</mo-field-select>
			</field-select-sizing-container>
		`)

		const selects = () => [...fixture.component.querySelectorAll('mo-field-select')]

		it('should fill exactly the space it is given', async () => {
			for (const select of selects()) {
				select.value = 'A rather long option text'
				await settle(select)
			}

			expect(selects().map(widthOf)).toEqual([220, 100])
		})
	})

	describe('height', () => {
		const fixture = new ComponentTestFixture<FieldSelect<string>>(html`
			<mo-field-select label='Size' value='M'>
				${sizes.map(size => html`<mo-option value=${size}>${size}</mo-option>`)}
			</mo-field-select>
		`)

		it('should keep the field 2.375rem high whatever line the engine gives the input', async () => {
			await settle(fixture.component)
			fixture.component.renderRoot.querySelector('input')!.style.lineHeight = '24px'
			await settle(fixture.component)

			const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
			expect(fixture.component.renderRoot.querySelector('mo-field')!.getBoundingClientRect().height).toBe(2.375 * rem)
		})

		it('should leave room for a font larger than the field\'s own', async () => {
			await settle(fixture.component)
			const input = fixture.component.renderRoot.querySelector('input')!
			input.style.fontSize = '24px'
			await settle(fixture.component)

			expect(input.getBoundingClientRect().height).toBeGreaterThanOrEqual(26)
		})
	})
})
