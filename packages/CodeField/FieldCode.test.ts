import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FieldCode } from './FieldCode.js'
import './index.js'

describe('FieldCode', () => {
	const fixture = new ComponentTestFixture<FieldCode>(html`<mo-field-code label='Verification code'></mo-field-code>`)

	const input = () => fixture.component.renderRoot.querySelector('input')!
	const cells = () => [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('[part=cell]')]
	const separators = () => [...fixture.component.renderRoot.querySelectorAll<HTMLElement>('[part=separator]')]
	const texts = () => cells().map(cell => cell.textContent)
	/** Records the field's own events, rather than stubbing the dispatchers which raise them. */
	const listen = (...types: Array<'input' | 'change'>) => types.map(type => {
		const listener = vi.fn()
		fixture.component.addEventListener(type, event => listener((event as CustomEvent<string | undefined>).detail))
		return listener
	})
	const leave = () => input().dispatchEvent(new Event('change', { bubbles: true }))
	const enter = async (value: string) => {
		input().value = value
		input().dispatchEvent(new Event('input', { bubbles: true }))
		await fixture.updateComplete
	}

	it('should render one cell per character of the code', () => {
		expect(cells().length).toBe(6)
	})

	it('should follow the length', async () => {
		fixture.component.length = 4
		await fixture.updateComplete

		expect(cells().length).toBe(4)
		expect(input().maxLength).toBe(4)
	})

	describe('accessibility', () => {
		it('should offer one named control and hide the cells from assistive technology', () => {
			expect(input().getAttribute('aria-label')).toBe('Verification code')
			expect(cells().every(cell => cell.getAttribute('aria-hidden') === 'true')).toBe(true)
		})

		it('should let a phone offer a code it has just received', () => {
			expect(input().getAttribute('autocomplete')).toBe('one-time-code')
			expect(input().inputMode).toBe('numeric')
		})

		it('should keep a code out of the autofill offers when asked to', async () => {
			fixture.component.autoComplete = 'off'
			await fixture.updateComplete

			expect(input().getAttribute('autocomplete')).toBe('off')
		})

		it('should render the label and focus the input when it is clicked', () => {
			const label = fixture.component.renderRoot.querySelector<HTMLElement>('[part=label]')!
			expect(label.textContent?.trim()).toBe('Verification code')

			label.click()

			expect(fixture.component.shadowRoot!.activeElement).toBe(input())
		})
	})

	describe('entering a code', () => {
		it('should draw the value into the cells', async () => {
			await enter('123')

			expect(texts()).toEqual(['1', '2', '3', '', '', ''])
		})

		it('should dispatch input for every character while an incomplete code stays uncommitted', async () => {
			const [input, change] = listen('input', 'change')

			await enter('12')

			expect(input).toHaveBeenCalledWith('12')
			expect(change).not.toHaveBeenCalled()
			expect(fixture.component.value).toBeUndefined()
		})

		it('should dispatch change on the last character, without waiting to be left', async () => {
			const [change] = listen('change')

			await enter('12345')
			expect(change).not.toHaveBeenCalled()

			await enter('123456')

			expect(change).toHaveBeenCalledExactlyOnceWith('123456')
			expect(fixture.component.value).toBe('123456')
		})

		it('should not dispatch change again when a completed code is left', async () => {
			await enter('123456')
			const [change] = listen('change')

			leave()

			expect(change).not.toHaveBeenCalled()
		})

		it('should commit an incomplete code once the field is left', async () => {
			const [change] = listen('change')

			await enter('12')
			leave()

			expect(change).toHaveBeenCalledExactlyOnceWith('12')
			expect(fixture.component.value).toBe('12')
		})

		// Shortening a complete code must not leave the committed value behind, showing a code nobody has.
		it('should commit a code edited back below its length once the field is left', async () => {
			await enter('123456')
			await enter('12345')
			leave()

			expect(fixture.component.value).toBe('12345')
		})

		it('should spread a pasted code over the cells', async () => {
			await enter('123456')

			expect(texts()).toEqual(['1', '2', '3', '4', '5', '6'])
		})

		it('should drop characters the code is not made of', async () => {
			await enter('1a2')

			expect(input().value).toBe('12')
		})

		it('should take letters when the type allows them', async () => {
			fixture.component.type = 'alphanumeric'
			await fixture.updateComplete

			await enter('1a2')

			expect(input().value).toBe('1a2')
			expect(input().inputMode).toBe('text')
		})

		it('should take only what an explicit pattern allows', async () => {
			fixture.component.pattern = '[0-3]'
			await fixture.updateComplete

			await enter('1234')

			expect(input().value).toBe('123')
		})

		it('should render the value it is given from outside', async () => {
			fixture.component.value = '4321'
			await fixture.updateComplete

			expect(texts().slice(0, 4)).toEqual(['4', '3', '2', '1'])
			expect(input().value).toBe('4321')
		})
	})

	describe('appearance', () => {
		it('should mask the characters when asked to', async () => {
			fixture.component.mask = '•'
			await fixture.updateComplete
			await enter('12')

			expect(texts().slice(0, 2)).toEqual(['•', '•'])
			expect(input().value).toBe('12')
		})

		it('should place separators between the cells', async () => {
			fixture.component.separators = [2]
			fixture.component.separator = '–'
			await fixture.updateComplete

			expect(separators().length).toBe(1)
			expect(separators()[0]!.textContent).toBe('–')
		})
	})

	describe('validity', () => {
		it('should be invalid while a required code is incomplete', async () => {
			fixture.component.required = true
			await enter('123')

			await expect(fixture.component.checkValidity()).resolves.toBe(false)

			await enter('123456')

			await expect(fixture.component.checkValidity()).resolves.toBe(true)
		})

		it('should honor a custom validity', async () => {
			await enter('123456')
			fixture.component.setCustomValidity('Wrong code')

			await expect(fixture.component.checkValidity()).resolves.toBe(false)
		})
	})
})