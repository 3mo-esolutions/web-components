import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { SegmentedDisplayController } from './SegmentedDisplayController.js'

@component('segmented-display-test')
class SegmentedDisplayTest extends Component {
	value = ''
	mask?: string
	separators?: ReadonlyArray<number>
	separator?: string
	autocomplete?: string
	/** Not `inputMode`, which every element already has. */
	mode?: string
	disabled = false
	readonly = false
	required = false
	invalid = false

	readonly inputs = new Array<string>()
	readonly changes = new Array<string>()
	readonly completions = new Array<string>()
	readonly focusChanges = new Array<boolean>()

	readonly controller = new SegmentedDisplayController<SegmentedDisplayTest>(this, host => ({
		length: 6,
		label: 'Verification code',
		placeholder: '·',
		get value() { return host.value },
		get mask() { return host.mask },
		get separators() { return host.separators },
		get separator() { return host.separator },
		get autocomplete() { return host.autocomplete },
		get inputMode() { return host.mode },
		get disabled() { return host.disabled },
		get readonly() { return host.readonly },
		get required() { return host.required },
		get invalid() { return host.invalid },
		accept: character => /\d/.test(character) ? character : undefined,
		handleInput: value => { host.value = value; host.inputs.push(value) },
		handleChange: value => host.changes.push(value),
		handleComplete: value => host.completions.push(value),
		handleFocusChange: focused => host.focusChanges.push(focused),
	}))

	get input() { return this.renderRoot.querySelector('input')! }
	get group() { return this.renderRoot.querySelector('div')! }
	get cells() { return [...this.renderRoot.querySelectorAll<HTMLElement>('[data-segment]')] }
	cell(key: string) { return this.renderRoot.querySelector<HTMLElement>(`[data-segment=${key}]`)! }
	get activeElement() { return this.shadowRoot!.activeElement }

	protected override get template() {
		return html`
			<div ${this.controller.group.ref()} style='display: flex; position: relative'>
				<input ${this.controller.input.ref()} style='position: absolute; inset: 0'>
				${this.controller.segments.map(segment => html`<span style='width: 20px' ${this.controller.segment.ref(segment)}></span>`)}
			</div>
		`
	}
}

describe('SegmentedDisplayController', () => {
	const fixture = new ComponentTestFixture<SegmentedDisplayTest>(html`<segmented-display-test></segmented-display-test>`)

	const host = () => fixture.component
	const controller = () => host().controller
	const input = () => host().input
	const cells = () => host().cells
	const cell = (key: string) => host().cell(key)
	const texts = () => cells().map(element => element.textContent)

	const setUp = async (changes: Partial<SegmentedDisplayTest>) => {
		Object.assign(host(), changes)
		await fixture.update()
	}
	const enter = async (value: string) => {
		input().value = value
		input().dispatchEvent(new Event('input', { bubbles: true }))
		await fixture.updateComplete
	}

	describe('the input', () => {
		it('should carry the name, the value and everything which makes a code arrive', () => {
			expect(input().type).toBe('text')
			expect(input().maxLength).toBe(6)
			expect(input().inputMode).toBe('numeric')
			expect(input().getAttribute('autocomplete')).toBe('one-time-code')
			expect(input().getAttribute('aria-label')).toBe('Verification code')
			expect(input().spellcheck).toBeFalse()
		})

		it('should take the autocomplete and input mode from the options', async () => {
			await setUp({ autocomplete: 'off', mode: 'text' })

			expect(input().getAttribute('autocomplete')).toBe('off')
			expect(input().inputMode).toBe('text')
		})

		it('should reflect disabled, readonly, required and invalid', async () => {
			await setUp({ disabled: true, readonly: true, required: true, invalid: true })

			expect(input().disabled).toBeTrue()
			expect(input().readOnly).toBeTrue()
			expect(input().required).toBeTrue()
			expect(input().getAttribute('aria-invalid')).toBe('true')
		})
	})

	describe('the cells', () => {
		it('should render one cell per character, hidden from assistive technology', () => {
			expect(cells().length).toBe(6)
			expect(cell('cell-0').getAttribute('aria-hidden')).toBe('true')
			expect(texts()).toEqual(['·', '·', '·', '·', '·', '·'])
		})

		it('should draw the value', async () => {
			await enter('123')

			expect(texts()).toEqual(['1', '2', '3', '·', '·', '·'])
			expect(cell('cell-0').hasAttribute('data-placeholder')).toBeFalse()
			expect(cell('cell-3').hasAttribute('data-placeholder')).toBeTrue()
		})

		it('should mask the value when asked to', async () => {
			await setUp({ mask: '•' })
			await enter('12')

			expect(texts().slice(0, 2)).toEqual(['•', '•'])
		})

		it('should place separators between the cells', async () => {
			await setUp({ separators: [2], separator: '–' })

			expect(cells().length).toBe(7)
			expect(cell('separator-2').textContent).toBe('–')
			expect(cell('separator-2').getAttribute('aria-hidden')).toBe('true')
		})

		it('should keep the separators apart from the mask', async () => {
			await setUp({ mask: '•', separators: [2], separator: '–' })
			await enter('1234')

			expect(texts()).toEqual(['•', '•', '•', '–', '•', '·', '·'])
		})

		it('should mark the cell at the caret while focused', async () => {
			input().dispatchEvent(new FocusEvent('focus'))
			await enter('12')

			expect(cell('cell-2').hasAttribute('data-active')).toBeTrue()
			expect(cell('cell-1').hasAttribute('data-active')).toBeFalse()
		})

		it('should mark no cell while the input is not focused', async () => {
			await enter('12')

			expect(cells().some(element => element.hasAttribute('data-active'))).toBeFalse()
		})
	})

	describe('editing', () => {
		it('should report the value as it is typed', async () => {
			await enter('12')

			expect(host().inputs).toEqual(['12'])
			expect(host().changes).toEqual([])
		})

		it('should report a change once the input is left', async () => {
			await enter('12')
			input().dispatchEvent(new Event('change', { bubbles: true }))

			expect(host().changes).toEqual(['12'])
		})

		it('should drop what the value does not take', async () => {
			await enter('1a2')

			expect(input().value).toBe('12')
			expect(host().inputs).toEqual(['12'])
		})

		it('should truncate a value longer than the length', async () => {
			await enter('123456789')

			expect(input().value).toBe('123456')
		})

		it('should report a completion once', async () => {
			await enter('12345')
			expect(host().completions).toEqual([])

			await enter('123456')
			expect(host().completions).toEqual(['123456'])

			await enter('123456')
			expect(host().completions).toEqual(['123456'])
		})

		it('should report a completion again after the value is emptied', async () => {
			await enter('123456')
			await enter('')
			await enter('123456')

			expect(host().completions).toEqual(['123456', '123456'])
		})

		it('should put the caret on a pressed cell', async () => {
			await enter('123456')

			const rect = cell('cell-2').getBoundingClientRect()
			host().group.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rect.left + 1 }))

			expect(input().selectionStart).toBe(2)
		})

		it('should report the focus entering and leaving', () => {
			input().dispatchEvent(new FocusEvent('focus'))
			input().dispatchEvent(new FocusEvent('blur'))

			expect(host().focusChanges).toEqual([true, false])
		})
	})

	describe('api', () => {
		it('should focus the input', () => {
			controller().focus()

			expect(host().activeElement).toBe(input())
		})

		it('should put the caret on a cell', async () => {
			await enter('123456')
			input().dispatchEvent(new FocusEvent('focus'))
			controller().select(3)

			expect(input().selectionStart).toBe(3)
			expect(cell('cell-3').hasAttribute('data-active')).toBeTrue()
		})

		it('should report a complete value', async () => {
			expect(controller().isComplete).toBeFalse()

			await enter('123456')

			expect(controller().isComplete).toBeTrue()
		})
	})
})