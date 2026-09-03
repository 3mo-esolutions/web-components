import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type Button, ButtonType } from './Button.js'
import { type Icon } from '@3mo/icon'
import './index.js'

type MdButton = HTMLElement & { disabled: boolean, updateComplete: Promise<unknown> }

const mdButtonSelector = 'md-text-button, md-outlined-button, md-filled-button, md-filled-tonal-button, md-elevated-button'

describe('Button', () => {
	describe('type', () => {
		const fixture = new ComponentTestFixture<Button>('mo-button')

		const tagByType = new Map([
			[ButtonType.Text, 'md-text-button'],
			[ButtonType.Outlined, 'md-outlined-button'],
			[ButtonType.Tonal, 'md-filled-tonal-button'],
			[ButtonType.Elevated, 'md-elevated-button'],
			[ButtonType.Filled, 'md-filled-button'],
		])

		for (const [type, tagName] of tagByType) {
			it(`should render a "${tagName}" element for the type "${type}"`, async () => {
				fixture.component.type = type
				await fixture.update()

				const mdButton = fixture.component.renderRoot.querySelector(mdButtonSelector)
				expect(mdButton?.tagName.toLowerCase()).toBe(tagName)
			})
		}

		it('should reflect "type" as an attribute, which the padding and button-group styling key off', async () => {
			const paddingOf = async () => {
				const mdButton = fixture.component.renderRoot.querySelector<MdButton>(mdButtonSelector)!
				await mdButton.updateComplete
				return getComputedStyle(mdButton).getPropertyValue('--mo-button-default-horizontal-padding').trim()
			}

			expect(fixture.component.getAttribute('type')).toBe(ButtonType.Text)
			expect(await paddingOf()).toBe('12px')

			fixture.component.type = ButtonType.Filled
			await fixture.update()

			expect(fixture.component.getAttribute('type')).toBe(ButtonType.Filled)
			expect(await paddingOf()).toBe('16px')
		})
	})

	describe('disabled', () => {
		const fixture = new ComponentTestFixture<Button>('mo-button')

		const mdButton = () => fixture.component.renderRoot.querySelector<MdButton>(mdButtonSelector)!

		it('should set pointer-events to "none" when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should tunnel "disabled" to the underlying md button', async () => {
			fixture.component.disabled = true
			await fixture.update()
			expect(mdButton().disabled).toBe(true)
		})

		it('should not be focusable while disabled', async () => {
			fixture.component.disabled = true
			await fixture.update()
			await mdButton().updateComplete
			; (document.activeElement as HTMLElement | null)?.blur()

			fixture.component.focus()

			expect(fixture.component.shadowRoot!.activeElement).toBeNull()
			expect(document.activeElement).not.toBe(fixture.component)
		})
	})

	describe('content', () => {
		describe('without slotted content', () => {
			const fixture = new ComponentTestFixture<Button>(html`<mo-button startIcon='home' endIcon='close'>Label</mo-button>`)

			it('should render a mo-icon for "startIcon" as the start slot\'s fallback', () => {
				const icon = fixture.component.renderRoot.querySelector<Icon>('slot[name=start] > mo-icon')
				expect(icon?.icon).toBe('home')
			})

			it('should render a mo-icon for "endIcon" as the end slot\'s fallback', () => {
				const icon = fixture.component.renderRoot.querySelector<Icon>('slot[name=end] > mo-icon')
				expect(icon?.icon).toBe('close')
			})
		})

		describe('with slotted content', () => {
			const fixture = new ComponentTestFixture<Button>(html`
				<mo-button startIcon='home' endIcon='close'>
					<span slot='start' id='slotted-start'>S</span>
					<span slot='end' id='slotted-end'>E</span>
					Label
				</mo-button>
			`)

			for (const slotName of ['start', 'end']) {
				it(`should let slotted content take precedence over the icon fallback of the "${slotName}" slot`, () => {
					const slot = fixture.component.renderRoot.querySelector<HTMLSlotElement>(`slot[name=${slotName}]`)!
					expect(slot.assignedElements().map(element => element.id)).toEqual([`slotted-${slotName}`])
				})
			}
		})
	})

	describe('focus', () => {
		const fixture = new ComponentTestFixture<Button>('mo-button')

		it('should delegate focus to the underlying md button', async () => {
			const mdButton = fixture.component.renderRoot.querySelector<MdButton>(mdButtonSelector)!
			await mdButton.updateComplete
			; (document.activeElement as HTMLElement | null)?.blur()

			fixture.component.focus()

			expect(fixture.component.shadowRoot!.activeElement).toBe(mdButton)
			expect(document.activeElement).toBe(fixture.component)
		})
	})

	describe('css parts', () => {
		const fixture = new ComponentTestFixture<Button>('mo-button')

		const selectorByPart = new Map([
			['button', 'button'],
			['ripple', 'md-ripple'],
			['focus-ring', 'md-focus-ring'],
		])

		for (const [part, selector] of selectorByPart) {
			it(`should export the css part "${part}" through the md button`, async () => {
				const mdButton = fixture.component.renderRoot.querySelector<MdButton>(mdButtonSelector)!
				await mdButton.updateComplete

				expect(mdButton.getAttribute('exportparts')?.split(',')).toContain(part)
				expect((mdButton.shadowRoot!.querySelector(selector))?.getAttribute('part')?.split(' ')).toContain(part)
			})
		}
	})
})