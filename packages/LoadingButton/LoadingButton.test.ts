import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type LoadingButton } from './LoadingButton.js'
import './index.js'

type MdButton = HTMLElement & { disabled: boolean }

const mdButtonSelector = 'md-text-button, md-outlined-button, md-filled-button, md-filled-tonal-button, md-elevated-button'

const settle = () => new Promise(resolve => setTimeout(resolve, 50))

describe('LoadingButton', () => {
	describe('disabled', () => {
		const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

		it('should stop click events when disabled', async () => {
			fixture.component.disabled = true
			await fixture.updateComplete
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})
	})

	describe('loading state', () => {
		const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

		it('should stop click events when loading', async () => {
			fixture.component.loading = true
			await fixture.updateComplete
			expect(getComputedStyle(fixture.component).pointerEvents).toBe('none')
		})

		it('should disable the underlying md button while loading', async () => {
			fixture.component.loading = true
			await fixture.update()

			expect(fixture.component.disabled).toBe(false)
			expect(fixture.component.renderRoot.querySelector<MdButton>(mdButtonSelector)?.disabled).toBe(true)
		})
	})

	describe('click event inference', () => {
		const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

		beforeEach(() => settle())

		const clickInternalButton = () => fixture.component.renderRoot.querySelector<HTMLElement>(mdButtonSelector)!.click()

		it('should enter loading until an async click listener settles', async () => {
			let complete!: () => void
			const pending = new Promise<void>(resolve => { complete = resolve })
			fixture.component.addEventListener('click', () => pending)

			clickInternalButton()

			expect(fixture.component.loading).toBe(true)

			complete()
			await settle()

			expect(fixture.component.loading).toBe(false)
		})

		it('should leave loading even when the listener rejects', async () => {
			let fail!: (reason: unknown) => void
			const pending = new Promise<void>((_, reject) => { fail = reject })
			fixture.component.addEventListener('click', () => pending)

			clickInternalButton()
			expect(fixture.component.loading).toBe(true)

			fail(new Error('intentional'))
			await settle()

			expect(fixture.component.loading).toBe(false)
		})

		it('should invoke a click listener exactly once per click', async () => {
			const spy = jasmine.createSpy('click').and.returnValue(Promise.resolve())
			fixture.component.addEventListener('click', spy)

			clickInternalButton()
			await settle()

			expect(spy).toHaveBeenCalledTimes(1)
		})

		it('should not enter loading for synchronous click listeners', async () => {
			fixture.component.addEventListener('click', () => { })

			clickInternalButton()

			expect(fixture.component.loading).toBe(false)

			await settle()

			expect(fixture.component.loading).toBe(false)
		})

		it('should not infer loading from a listener removed via removeEventListener', async () => {
			const listener = () => new Promise<void>(() => { })
			fixture.component.addEventListener('click', listener)
			fixture.component.removeEventListener('click', listener)

			clickInternalButton()
			await settle()

			expect(fixture.component.loading).toBe(false)
		})

		it('should not infer loading when "preventClickEventInference" is set', async () => {
			fixture.component.preventClickEventInference = true
			await fixture.update()
			fixture.component.addEventListener('click', () => new Promise<void>(() => { }))

			clickInternalButton()
			await settle()

			expect(fixture.component.loading).toBe(false)
		})

		it('should not reject when disconnected before its first update', async () => {
			const rejections = new Array<PromiseRejectionEvent>()
			const listener = (e: PromiseRejectionEvent) => rejections.push(e)
			window.addEventListener('unhandledrejection', listener)

			const button = document.createElement('mo-loading-button')
			document.body.appendChild(button)
			button.remove()
			await settle()

			window.removeEventListener('unhandledrejection', listener)
			expect(rejections.map(e => String(e.reason))).toEqual([])
		})
	})

	describe('progress indicator', () => {
		const fixture = new ComponentTestFixture<LoadingButton>('mo-loading-button')

		it('should overlay a centered circular progress while loading', async () => {
			expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).toBeNull()

			fixture.component.loading = true
			await fixture.update()

			const progress = fixture.component.renderRoot.querySelector('mo-circular-progress')!
			expect(progress).not.toBeNull()
			expect(getComputedStyle(progress).position).toBe('absolute')
			expect(progress.style.top).toBe('50%')
			expect(progress.style.insetInlineStart).toBe('50%')
		})

		it('should remove the circular progress when loading ends', async () => {
			fixture.component.loading = true
			await fixture.update()
			expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).not.toBeNull()

			fixture.component.loading = false
			await fixture.update()

			expect(fixture.component.renderRoot.querySelector('mo-circular-progress')).toBeNull()
		})

		const withStartIconFixture = new ComponentTestFixture<LoadingButton>(html`<mo-loading-button startIcon='home'>Label</mo-loading-button>`)

		it('should replace the start icon with the circular progress while loading when "startIcon" is set', async () => {
			expect(withStartIconFixture.component.renderRoot.querySelector('slot[name=start] > mo-icon')).not.toBeNull()

			withStartIconFixture.component.loading = true
			await withStartIconFixture.update()

			expect(withStartIconFixture.component.renderRoot.querySelector('slot[name=start] > mo-icon')).toBeNull()
			const progress = withStartIconFixture.component.renderRoot.querySelector('slot[name=start] > mo-circular-progress')!
			expect(progress).not.toBeNull()
			expect(getComputedStyle(progress).position).not.toBe('absolute')
		})
	})
})