import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldTextArea } from './FieldTextArea.js'
import { expectFieldPropertyTunnelsToInput, expectInputEventTunnelsToField, expectSlotRendersOnlyWithAssignedContent } from '../Field/InputFieldComponent.test.js'
import './index.js'

describe('FieldTextArea', () => {
	const fixture = new ComponentTestFixture<FieldTextArea>('mo-field-text-area')

	it('should render a textarea instead of an input', () => {
		expect(fixture.component.inputElement).toBeInstanceOf(HTMLTextAreaElement)
		expect(fixture.component.renderRoot.querySelector('input')).toBeNull()
	})

	describe('tunneling to the textarea', () => {
		it('should set the part attribute', () => expect(fixture.component.inputElement.getAttribute('part')).toBe('input'))
		it('should tunnel disabled', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'disabled' }))
		it('should tunnel readonly', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, fieldKey: 'readonly', inputKey: 'readOnly' }))
		it('should tunnel required', () => expectFieldPropertyTunnelsToInput(fixture, { value: true, key: 'required' }))
		it('should tunnel value', () => expectFieldPropertyTunnelsToInput(fixture, { value: 'Test', key: 'value' }))

		it('should preserve a multiline value across the input round-trip', async () => {
			const multiline = 'first line\nsecond line'

			fixture.component.inputElement.value = multiline
			fixture.component.inputElement.dispatchEvent(new Event('change'))
			await fixture.updateComplete

			expect(fixture.component.value).toBe(multiline)
			expect(fixture.component.inputElement.value).toBe(multiline)
		})
	})

	describe('sizing', () => {
		const height = () => fixture.component.inputElement.getBoundingClientRect().height
		const type = async (value: string) => {
			fixture.component.inputElement.value = value
			fixture.component.inputElement.dispatchEvent(new Event('input'))
			await fixture.updateComplete
		}

		it('should be two lines high while it holds less', async () => {
			const empty = height()
			await type('one line')

			expect(height()).toBe(empty)
			await type('one\ntwo')
			expect(height()).toBe(empty)
			await type('one\ntwo\nthree\nfour')
			expect(height()).toBeCloseTo(2 * empty, 0)
		})

		it('should grow in height with its text, and not in width', async () => {
			fixture.component.style.width = 'fit-content'
			await fixture.updateComplete
			const { width, height: empty } = fixture.component.getBoundingClientRect()

			await type('one\ntwo\nthree\nfour, in a line which is a good deal longer than the field is wide by itself')

			expect(fixture.component.getBoundingClientRect().width).toBe(width)
			expect(fixture.component.getBoundingClientRect().height).toBeGreaterThan(empty * 1.5)
			expect(fixture.component.inputElement.scrollHeight).toBeLessThanOrEqual(fixture.component.inputElement.clientHeight)
		})

		it('should start as high as a min-height set on the element, with its label on the first line, and grow beyond it', async () => {
			fixture.component.label = 'Label'
			fixture.component.style.minHeight = '10rem'
			await fixture.updateComplete
			const label = fixture.component.renderRoot.querySelector('mo-field')!.renderRoot.querySelector('span')!
			label.style.transition = 'none'
			const field = () => fixture.component.renderRoot.querySelector('mo-field')!.getBoundingClientRect()
			const textarea = () => fixture.component.inputElement.getBoundingClientRect()

			expect(fixture.component.getBoundingClientRect().height).toBe(160)
			expect(field().height).toBe(160)
			expect(field().bottom - textarea().bottom).toBeLessThan(10)
			expect(label.getBoundingClientRect().top - textarea().top).toBeLessThan(4)

			await type(Array.from({ length: 12 }, (_, i) => i).join('\n'))

			expect(fixture.component.getBoundingClientRect().height).toBeGreaterThan(160)
			expect(fixture.component.inputElement.scrollHeight).toBeLessThanOrEqual(fixture.component.inputElement.clientHeight)
		})

		it('should stop growing at a max-height set on its input part, and scroll beyond it', async () => {
			const limited = fixture.component.inputElement
			const empty = height()
			limited.style.maxHeight = '4lh'
			await type('1\n2\n3\n4\n5\n6\n7')

			expect(height()).toBeCloseTo(2 * empty, 0)
			expect(limited.scrollHeight).toBeGreaterThan(limited.clientHeight)
		})

		it('should keep the label clear of text scrolled away', async () => {
			fixture.component.label = 'Label'
			const label = fixture.component.renderRoot.querySelector('mo-field')!.renderRoot.querySelector('span')!
			fixture.component.inputElement.style.maxHeight = '2lh'
			await type('1\n2\n3\n4')

			expect(fixture.component.inputElement.getBoundingClientRect().top).toBeGreaterThanOrEqual(label.getBoundingClientRect().top + parseFloat(getComputedStyle(label).fontSize))
		})
	})

	describe('with end content, higher than one line', () => {
		const withEnd = new ComponentTestFixture<FieldTextArea>(html`
			<mo-field-text-area label='Label' style='min-height: 10rem'>
				<span slot='end'>End</span>
				<span slot='end' style='align-self: flex-end'>Bottom</span>
			</mo-field-text-area>
		`)

		it('should keep the end content at the top', async () => {
			const end = withEnd.component.querySelectorAll('span')[0]!
			await vi.waitFor(() => expect(end.getBoundingClientRect().height).toBeGreaterThan(0))
			const field = withEnd.component.renderRoot.querySelector('mo-field')!.getBoundingClientRect()

			expect(field.height).toBe(160)
			expect(end.getBoundingClientRect().top - field.top).toBeLessThan(12)
		})

		it('should let end content align itself to the bottom', async () => {
			const bottom = withEnd.component.querySelectorAll('span')[1]!
			await vi.waitFor(() => expect(bottom.getBoundingClientRect().height).toBeGreaterThan(0))
			const field = withEnd.component.renderRoot.querySelector('mo-field')!.getBoundingClientRect()

			expect(field.bottom - bottom.getBoundingClientRect().bottom).toBeLessThan(12)
		})
	})

	describe('events', () => {
		it('should proxy input event', () => expectInputEventTunnelsToField(fixture, 'input', 'test'))
		it('should proxy change event', () => expectInputEventTunnelsToField(fixture, 'change', 'test'))
	})

	describe('slots', () => {
		it('should render an start slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'start'))
		it('should render an end slot only if there are assigned elements', () => expectSlotRendersOnlyWithAssignedContent(fixture, 'end'))
	})
})
