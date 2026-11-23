import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Field } from './Field.js'
import './index.js'
import { userEvent } from 'vitest/browser'

const labelOf = (field: Field) => field.renderRoot.querySelector('span')!

/** Whether the label floats at the top of the content, smaller than the 14px it rests at, rather than resting in its middle. */
const isLifted = (field: Field) => {
	const label = labelOf(field).getBoundingClientRect()
	const container = field.renderRoot.querySelector('div')!.getBoundingClientRect()
	return label.top - container.top < 3 && label.height < 13
}

describe('Field', () => {
	const fixture = new ComponentTestFixture<Field>(html`<mo-field label='Label'></mo-field>`)

	const tick = () => new Promise(resolve => setTimeout(resolve, 10))

	const labelText = () => fixture.component.renderRoot.querySelector('span')?.textContent?.replace(/\s+/g, ' ').trim()

	const slot = (name: string) => fixture.component.renderRoot.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)

	const appendSlottedInput = async (attributes: Record<string, string> = {}) => {
		const input = document.createElement('input')
		for (const [name, value] of Object.entries(attributes)) {
			input.setAttribute(name, value)
		}
		fixture.component.append(input)
		await tick()
		return input
	}

	describe('attribute reflection', () => {
		it('should reflect label as an attribute', async () => {
			fixture.component.label = 'Name'
			await fixture.updateComplete

			expect(fixture.component.getAttribute('label')).toBe('Name')
		})

		for (const property of ['readonly', 'disabled', 'required', 'dense', 'populated', 'invalid', 'active'] as const) {
			it(`should reflect ${property} as an attribute`, async () => {
				expect(fixture.component.hasAttribute(property)).toBe(false)

				fixture.component[property] = true
				await fixture.updateComplete

				expect(fixture.component.hasAttribute(property)).toBe(true)
			})
		}
	})

	describe('label', () => {
		it('should render the label text', async () => {
			expect(labelText()).toBe('Label')

			fixture.component.label = 'Other'
			await fixture.updateComplete

			expect(labelText()).toBe('Other')
		})

		it('should append an asterisk to the label when required', async () => {
			expect(labelText()).toBe('Label')

			fixture.component.required = true
			await fixture.updateComplete

			expect(labelText()).toBe('Label *')
		})
	})

	describe('slots', () => {
		for (const name of ['start', 'end'] as const) {
			it(`should render the ${name} slot only when it has assigned content`, async () => {
				expect(slot(name)).toBeNull()

				const content = document.createElement('div')
				content.slot = name
				fixture.component.append(content)
				await fixture.update()

				expect(slot(name)?.assignedNodes().length).toBe(1)
				expect(slot(name)?.assignedNodes()[0]).toBe(content)

				content.remove()
				await fixture.update()

				expect(slot(name)).toBeNull()
			})
		}
	})

	describe('label', () => {
		const fixture = new ComponentTestFixture<Field>(html`
			<mo-field label='Label'>
				<input>
			</mo-field>
		`)

		const input = () => fixture.component.querySelector('input')!
		const contentBox = () => {
			const box = input().getBoundingClientRect()
			const { paddingTop, fontSize } = getComputedStyle(input())
			return { top: box.top + parseFloat(paddingTop), bottom: box.bottom, fontSize }
		}

		beforeEach(async () => {
			await fixture.updateComplete
			labelOf(fixture.component).style.transition = 'none'
		})

		it('should draw the content and the resting label at 0.875rem', () => {
			const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)

			expect(getComputedStyle(input()).fontSize).toBe(`${0.875 * rem}px`)
			expect(getComputedStyle(labelOf(fixture.component)).fontSize).toBe(`${0.875 * rem}px`)
		})

		it('should rest in the middle at the size of the content it stands for', () => {
			const label = labelOf(fixture.component).getBoundingClientRect()
			const container = fixture.component.renderRoot.querySelector('div')!.getBoundingClientRect()

			expect(getComputedStyle(labelOf(fixture.component)).fontSize).toBe(contentBox().fontSize)
			expect(Math.abs((label.top + label.bottom) / 2 - (container.top + container.bottom) / 2)).toBeLessThan(1)
		})

		it('should not cut its descenders while it ellipsizes a label too long for the field', () => {
			const style = getComputedStyle(labelOf(fixture.component))

			expect(style.overflowY).toBe('visible')
			expect(style.textOverflow).toBe('ellipsis')
		})

		it('should float clear above the content, at no less than 12px', async () => {
			fixture.component.populated = true
			await fixture.updateComplete

			expect(parseFloat(getComputedStyle(labelOf(fixture.component)).fontSize)).toBeGreaterThanOrEqual(12)

			expect(isLifted(fixture.component)).toBe(true)
			expect(labelOf(fixture.component).getBoundingClientRect().bottom).toBeLessThanOrEqual(contentBox().top)
		})

		it('should stay a placeholder in a dense field, also while focused', async () => {
			fixture.component.dense = true
			fixture.component.active = true
			await fixture.updateComplete

			expect(isLifted(fixture.component)).toBe(false)
		})

		it('should slide rather than jump between resting and floating, and grow the underline by a transform', () => {
			labelOf(fixture.component).style.removeProperty('transition')

			expect(getComputedStyle(labelOf(fixture.component)).transitionProperty.split(', ').sort()).toEqual(['color', 'font-size', 'top'])
			expect(getComputedStyle(fixture.component, '::after').transitionProperty).toBe('scale')
		})
	})

	describe('without a host setting its state', () => {
		const fixture = new ComponentTestFixture<Field>(html`
			<mo-field label='Label'>
				<input>
			</mo-field>
		`)

		const input = () => fixture.component.querySelector('input')!
		const label = () => fixture.component.renderRoot.querySelector('span')!
		const settle = async () => {
			await fixture.updateComplete
			label().style.transition = 'none'
		}

		it('should draw the accent and lift the label while its input has focus', async () => {
			await settle()
			const accent = document.createElement('div')
			accent.style.color = 'var(--mo-color-accent)'
			fixture.component.append(accent)
			const accentColor = getComputedStyle(accent).color
			accent.remove()
			expect(getComputedStyle(label()).color).not.toBe(accentColor)

			await userEvent.click(input())
			await settle()

			expect(getComputedStyle(label()).color).toBe(accentColor)
			expect(getComputedStyle(fixture.component).borderBottomColor).toBe(accentColor)
			expect(isLifted(fixture.component)).toBe(true)
		})
	})

	describe('without a label', () => {
		const fixture = new ComponentTestFixture<Field>(html`
			<mo-field>
				<input value='lb'>
			</mo-field>
		`)

		it('should center its content at the height of a field with a label', async () => {
			fixture.component.label = 'Label'
			await fixture.updateComplete
			const labelledHeight = fixture.component.getBoundingClientRect().height
			fixture.component.label = ''
			await fixture.updateComplete
			expect(fixture.component.getBoundingClientRect().height).toBeCloseTo(labelledHeight, 1)
			const field = fixture.component.getBoundingClientRect()
			const input = fixture.component.querySelector('input')!
			const box = input.getBoundingClientRect()
			const { paddingTop, paddingBottom } = getComputedStyle(input)
			const contentCenter = box.top + parseFloat(paddingTop) + (box.height - parseFloat(paddingTop) - parseFloat(paddingBottom)) / 2

			expect(Math.abs(contentCenter - (field.top + field.bottom) / 2)).toBeLessThan(1)
		})
	})

	describe('height', () => {
		const fixture = new ComponentTestFixture<Field>(html`
			<mo-field label='Label'>
				<input>
			</mo-field>
		`)

		const height = () => fixture.component.getBoundingClientRect().height
		const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize)

		it('should be 2.375rem high, and 1.75rem when dense', async () => {
			expect(height()).toBe(2.375 * rem())

			fixture.component.dense = true
			await fixture.update()

			expect(height()).toBe(1.75 * rem())
		})

		it('should keep that height whatever line the engine gives the input', async () => {
			fixture.component.querySelector('input')!.style.lineHeight = '24px'
			await fixture.update()

			expect(height()).toBe(2.375 * rem())
		})

		it('should leave room for a font larger than the field\'s own', async () => {
			const input = fixture.component.querySelector('input')!
			input.style.fontSize = '24px'
			await fixture.update()

			expect(input.getBoundingClientRect().height - parseFloat(getComputedStyle(input).paddingTop)).toBeGreaterThanOrEqual(26)
		})

		it('should not grow for start or end content as high as an icon button', async () => {
			const button = document.createElement('div')
			button.slot = 'end'
			button.style.cssText = 'width: 36px; height: 36px'
			fixture.component.append(button)
			await fixture.update()
			const field = fixture.component.getBoundingClientRect()
			const box = button.getBoundingClientRect()

			expect(height()).toBe(2.375 * rem())
			expect(box.top).toBeGreaterThanOrEqual(field.top)
			expect(box.bottom).toBeLessThanOrEqual(field.bottom)
		})

		it('should not grow when dense for start or end content as high as a dense icon button', async () => {
			fixture.component.dense = true
			const button = document.createElement('div')
			button.slot = 'end'
			button.style.cssText = 'width: 28px; height: 28px'
			fixture.component.append(button)
			await fixture.update()

			expect(height()).toBe(1.75 * rem())
		})

		it('should keep that height while only its start or end holds content', async () => {
			fixture.component.label = ''
			fixture.component.renderRoot.querySelector('div')!.style.display = 'none'
			await fixture.update()

			expect(height()).toBe(2.375 * rem())
		})
	})

	describe('sizing', () => {
		const fixture = new ComponentTestFixture<Field>(html`
			<mo-field label='Label' style='width: fit-content'>
				<input>
			</mo-field>
		`)

		const input = () => fixture.component.querySelector('input')!
		const width = (element: Element = fixture.component) => element.getBoundingClientRect().width

		it('should keep its width whatever the value is', async () => {
			const initial = width()

			input().value = 'A value which is a good deal longer than the field is wide by itself'
			fixture.component.populated = true
			await fixture.updateComplete

			expect(initial).toBeGreaterThan(140)
			expect(width()).toBe(initial)
		})

		it('should keep the width of a label wider than the input once the label floats and shrinks', async () => {
			fixture.component.label = 'A label which is a good deal wider than the input is by itself'
			await fixture.updateComplete
			const initial = width()

			labelOf(fixture.component).style.transition = 'none'
			fixture.component.active = true
			await fixture.updateComplete

			expect(width(labelOf(fixture.component))).toBeGreaterThan(160)
			expect(isLifted(fixture.component)).toBe(true)
			expect(width()).toBe(initial)
		})

		it('should fill the width it is given, also one narrower than the input is by itself', async () => {
			for (const size of [400, 80]) {
				fixture.component.style.width = `${size}px`
				await fixture.updateComplete

				expect(width(input())).toBe(width(fixture.component.renderRoot.querySelector('div')!))
				expect(width()).toBe(size)
			}
		})
	})

	describe('slotted input direction', () => {
		it('should wire the direction controller on slotchange so the slotted input gets dir="auto"', async () => {
			const input = await appendSlottedInput()

			expect(input.getAttribute('dir')).toBe('auto')
		})

		it('should mirror an rtl slotted input\'s direction onto the host', async () => {
			expect(fixture.component.dir).toBe('')

			await appendSlottedInput({ dir: 'rtl' })

			expect(fixture.component.dir).toBe('rtl')
		})

		it('should follow the text control inside a slotted wrapper rather than the wrapper', async () => {
			const wrapper = document.createElement('div')
			const input = document.createElement('input')
			input.setAttribute('dir', 'rtl')
			wrapper.append(input, Object.assign(document.createElement('span'), { textContent: 'ltr text' }))
			fixture.component.append(wrapper)
			await tick()

			expect(wrapper.hasAttribute('dir')).toBe(false)
			expect(fixture.component.dir).toBe('rtl')
		})
	})
})
