import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Field } from './Field.js'

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
				expect(fixture.component.hasAttribute(property)).toBeFalse()

				fixture.component[property] = true
				await fixture.updateComplete

				expect(fixture.component.hasAttribute(property)).toBeTrue()
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
	})
})