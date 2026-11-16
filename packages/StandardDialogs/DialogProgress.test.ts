import { html } from '@a11d/lit'
import { type Dialog } from '@3mo/dialog'
import { DialogProgress } from './DialogProgress.js'
import './index.js'

describe('DialogProgress', () => {
	const deferred = <T>() => {
		let resolve!: (value: T) => void
		let reject!: (reason: unknown) => void
		const promise = new Promise<T>((res, rej) => [resolve, reject] = [res, rej])
		return { promise, resolve, reject }
	}

	const openDialogs = new Set<DialogProgress<any>>()

	const open = <T>(parameters: DialogProgress<T>['parameters']) => {
		const dialog = new DialogProgress<T>(parameters)
		openDialogs.add(dialog)
		const confirmation = dialog.confirm()
		confirmation.catch(() => void 0)
		return { dialog, confirmation }
	}

	const rendered = async (dialog: DialogProgress<any>) => {
		await vi.waitFor(() => expect(dialog.dialogElement?.open).toBe(true))
		await dialog.dialogElement.updateComplete
		return dialog.dialogElement as Dialog
	}

	// md-dialog opens asynchronously and throws when its element was removed meanwhile.
	afterEach(async () => {
		await new Promise(resolve => setTimeout(resolve, 50))
		openDialogs.forEach(dialog => dialog.remove())
		openDialogs.clear()
	})

	describe('Rendering', () => {
		it('should show the heading and a progress indicator', async () => {
			const { dialog } = open({ heading: 'The invoice is being generated…', action: () => deferred().promise })
			const dialogElement = await rendered(dialog)

			expect(dialogElement.heading).toBe('The invoice is being generated…')
			expect(dialogElement.renderRoot.querySelector('mo-heading')?.textContent).toBe('The invoice is being generated…')
			expect(dialogElement.querySelector('mo-circular-progress')).not.toBeNull()
		})

		it('should be blocking, without a close button or a footer', async () => {
			const { dialog } = open({ heading: 'Exporting…', action: () => deferred().promise })
			const dialogElement = await rendered(dialog)

			expect(dialogElement.blocking).toBe(true)
			expect(dialogElement.preventCancellationOnEscape).toBe(true)
			expect(dialogElement.renderRoot.querySelector('mo-icon-button[icon=close]')).toBeNull()
			expect(dialogElement.renderRoot.querySelector('[part=footer]')).toBeNull()
		})

		describe('with a custom indicator', () => {
			class TestDialogProgress extends DialogProgress<void> {
				protected override get indicatorTemplate() {
					return html`<mo-icon id='indicator' icon='contactless'></mo-icon>`
				}
			}
			customElements.define('test-dialog-progress', TestDialogProgress)

			it('should render the indicator of a subclass in place of the circular progress', async () => {
				const dialog = new TestDialogProgress({ heading: 'Paying…', action: () => deferred<void>().promise })
				openDialogs.add(dialog)
				dialog.confirm().catch(() => void 0)
				const dialogElement = await rendered(dialog)

				expect(dialogElement.querySelector('#content > #indicator')).not.toBeNull()
				expect(dialogElement.querySelector('mo-circular-progress')).toBeNull()
			})
		})

		describe('with content', () => {
			it('should show text content below the progress indicator', async () => {
				const { dialog } = open({ heading: 'Exporting…', content: 'This may take a minute.', action: () => deferred().promise })
				const dialogElement = await rendered(dialog)

				const container = dialogElement.querySelector('#content')!
				expect(container.firstElementChild?.localName).toBe('mo-circular-progress')
				expect(container.textContent?.trim()).toBe('This may take a minute.')
			})

			it('should render content given as a function, called with the dialog', async () => {
				let context: unknown
				const { dialog } = open({
					heading: 'Exporting…',
					content() {
						context = this
						return html`<p id='hint'>1,204 orders</p>`
					},
					action: () => deferred().promise,
				})
				const dialogElement = await rendered(dialog)

				expect(dialogElement.querySelector('#hint')?.textContent).toBe('1,204 orders')
				expect(context).toBe(dialog)
			})
		})
	})

	describe('Running the task', () => {
		it('should run the action once as the dialog opens, called with the dialog', async () => {
			const action = vi.fn(function (this: DialogProgress<void>) { return deferred<void>().promise })
			const { dialog } = open({ heading: 'Working…', action })

			await rendered(dialog)

			expect(action).toHaveBeenCalledOnce()
			expect(action.mock.contexts[0]).toBe(dialog)
		})

		it('should stay open while the action runs', async () => {
			const { dialog } = open({ heading: 'Working…', action: () => deferred().promise })

			await rendered(dialog)
			await new Promise(resolve => setTimeout(resolve, 100))

			expect(dialog.isConnected).toBe(true)
			expect(dialog.dialogElement.open).toBe(true)
		})

		it('should ignore Escape while the action runs', async () => {
			const { dialog, confirmation } = open({ heading: 'Working…', action: () => deferred().promise })
			const settled = vi.fn()
			confirmation.then(settled, settled)
			await rendered(dialog)

			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
			await new Promise(resolve => setTimeout(resolve, 50))

			expect(settled).not.toHaveBeenCalled()
			expect(dialog.isConnected).toBe(true)
		})

		describe('when the action resolves', () => {
			it('should close and resolve with its result', async () => {
				const task = deferred<number>()
				const { dialog, confirmation } = open({ heading: 'Generating…', action: () => task.promise })
				await rendered(dialog)

				task.resolve(4711)

				await expect(confirmation).resolves.toBe(4711)
				expect(dialog.isConnected).toBe(false)
			})

			it('should resolve with the result of a synchronous action', async () => {
				const { dialog, confirmation } = open({ heading: 'Generating…', action: () => 'done' })

				await expect(confirmation).resolves.toBe('done')
				expect(dialog.isConnected).toBe(false)
			})
		})

		describe('when the action fails', () => {
			it('should close and reject with its error', async () => {
				const task = deferred<number>()
				const error = new Error('The PDF service is unavailable')
				const { dialog, confirmation } = open({ heading: 'Generating…', action: () => task.promise })
				await rendered(dialog)

				task.reject(error)

				await expect(confirmation).rejects.toBe(error)
				expect(dialog.isConnected).toBe(false)
			})

			it('should reject with an error caused by a thrown value that is not an error', async () => {
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
				const { confirmation } = open({ heading: 'Generating…', action: () => Promise.reject('unavailable') })

				const error = await confirmation.catch((e: unknown) => e)

				expect(error).toBeInstanceOf(Error)
				expect((error as Error).message).toBe('unavailable')
				expect((error as Error).cause).toBe('unavailable')
			})
		})
	})
})
