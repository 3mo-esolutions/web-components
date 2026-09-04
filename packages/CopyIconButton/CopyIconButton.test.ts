import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type CopyIconButton } from './CopyIconButton.js'
import './index.js'

describe('CopyIconButton', () => {
	const fixture = new ComponentTestFixture<CopyIconButton>('mo-copy-icon-button')

	const clipboard: Pick<Clipboard, 'writeText'> = { writeText: () => Promise.resolve() }

	beforeEach(() => {
		// "navigator.clipboard" is a prototype getter which is absent outside of secure contexts, so it is shadowed instead of spied on.
		Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
		fixture.component.value = 'Copy me'
		fixture.component.feedbackDuration = 25
	})

	afterEach(() => Reflect.deleteProperty(navigator, 'clipboard'))

	const getIconButton = () => fixture.component.renderRoot.querySelector('mo-icon-button')!

	const getSwap = () => fixture.component.renderRoot.querySelector('mo-swap')!

	const getStatus = () => fixture.component.renderRoot.querySelector('[role=status]')!

	const click = async () => {
		await fixture.updateComplete
		getIconButton().click()
		await new Promise(resolve => setTimeout(resolve))
	}

	it('should copy the value to the clipboard when clicked', async () => {
		const writeText = spyOn(clipboard, 'writeText').and.resolveTo()

		await click()

		expect(writeText).toHaveBeenCalledOnceWith('Copy me')
	})

	it('should also copy when clicked programmatically on the element itself', async () => {
		const writeText = spyOn(clipboard, 'writeText').and.resolveTo()

		fixture.component.click()
		await new Promise(resolve => setTimeout(resolve))

		expect(writeText).toHaveBeenCalledOnceWith('Copy me')
	})

	it('should not copy while disabled', async () => {
		const writeText = spyOn(clipboard, 'writeText').and.resolveTo()
		fixture.component.disabled = true

		await click()

		expect(writeText).not.toHaveBeenCalled()
		expect(getSwap().value).toBe('')
	})

	it('should dispatch "copy" with the value which has been copied', async () => {
		spyOn(clipboard, 'writeText').and.resolveTo()
		const handler = jasmine.createSpy('copy')
		fixture.component.addEventListener('copy', handler)

		await click()

		expect(handler.calls.mostRecent().args[0].detail).toBe('Copy me')
	})

	it('should show the success state and revert to the icon afterwards', async () => {
		spyOn(clipboard, 'writeText').and.resolveTo()

		await click()
		expect(getSwap().value).toBe('success')

		await new Promise(resolve => setTimeout(resolve, 50))
		expect(getSwap().value).toBe('')
	})

	it('should show the error state and dispatch "copyError" when the clipboard rejects', async () => {
		const reason = new Error('Denied')
		spyOn(clipboard, 'writeText').and.rejectWith(reason)
		const handler = jasmine.createSpy('copyError')
		fixture.component.addEventListener('copyError', handler)

		await click()

		expect(getSwap().value).toBe('error')
		expect(handler.calls.mostRecent().args[0].detail).toBe(reason)
	})

	it('should treat an absent value as an error without touching the clipboard', async () => {
		const writeText = spyOn(clipboard, 'writeText').and.resolveTo()
		fixture.component.value = ''

		await click()

		expect(writeText).not.toHaveBeenCalled()
		expect(getSwap().value).toBe('error')
	})

	it('should announce the outcome, as it is otherwise only conveyed by an icon', async () => {
		spyOn(clipboard, 'writeText').and.resolveTo()
		expect(getStatus().textContent?.trim()).toBe('')

		await click()
		expect(getStatus().textContent?.trim()).toBe('Copied')

		await new Promise(resolve => setTimeout(resolve, 50))
		expect(getStatus().textContent?.trim()).toBe('')
	})

	it('should render the resting, success and error icons', async () => {
		fixture.component.icon = 'file_copy'
		fixture.component.successIcon = 'done_all'
		fixture.component.errorIcon = 'block'

		await fixture.updateComplete

		const icons = [...fixture.component.renderRoot.querySelectorAll('mo-icon')].map(icon => icon.icon)
		expect(icons).toEqual(['file_copy', 'done_all', 'block'])
	})

	describe('tooltip', () => {
		const getLabelOf = (component: CopyIconButton) =>
			component.renderRoot.querySelector('mo-icon-button')!.getAttribute('aria-label')

		const untilLabelled = async (component: CopyIconButton, deadline: number) => {
			await component.updateComplete
			const end = performance.now() + deadline
			while (getLabelOf(component) === null) {
				if (performance.now() > end) {
					return false
				}
				await new Promise(resolve => requestIdleCallback(resolve, { timeout: 50 }))
				await new Promise(resolve => setTimeout(resolve))
			}
			return true
		}

		const settle = async (component: CopyIconButton) => {
			if (await untilLabelled(component, 2000) === false) {
				throw new Error('Timed out waiting until the tooltip named the button.')
			}
		}

		it('should name the button "Copy" by default', async () => {
			await settle(fixture.component)

			expect(getLabelOf(fixture.component)).toBe('Copy')
		})

		describe('with a label', () => {
			const labelled = new ComponentTestFixture<CopyIconButton>(html`<mo-copy-icon-button label='Copy API key'></mo-copy-icon-button>`)

			it('should name the button after it', async () => {
				await settle(labelled.component)

				expect(getLabelOf(labelled.component)).toBe('Copy API key')
			})
		})

		describe('with an empty label', () => {
			const unlabelled = new ComponentTestFixture<CopyIconButton>(html`<mo-copy-icon-button label=''></mo-copy-icon-button>`)

			it('should have no tooltip at all', async () => {
				await untilLabelled(unlabelled.component, 750)

				expect(getLabelOf(unlabelled.component)).toBeNull()
			})
		})
	})

	it('should forward "disabled" and "dense" to the icon-button', async () => {
		fixture.component.disabled = true
		fixture.component.dense = true

		await fixture.updateComplete

		expect(getIconButton().disabled).toBe(true)
		expect(getIconButton().dense).toBe(true)
	})

	it('should forward focus() to the inner icon-button', async () => {
		await fixture.updateComplete
		; (document.activeElement as HTMLElement | null)?.blur()

		fixture.component.focus()
		await new Promise(resolve => setTimeout(resolve))

		expect(fixture.component.shadowRoot!.activeElement).toBe(getIconButton())
		expect(document.activeElement).toBe(fixture.component)
	})
})