import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@3mo/loading-button'
import { userEvent } from 'vitest/browser'
import { type Mock } from 'vitest'
import { filePicker, FilePickerController, type FilePickerOptions } from './filePicker.js'

function createFile(name: string, type = 'text/plain') {
	return new File(['content'], name, { type })
}

const settle = () => new Promise<void>(resolve => setTimeout(resolve))

/** Stands in for the file dialog, which no spec can operate: the input is never really clicked. */
const dialog = {
	get input() {
		return document.body.querySelector<HTMLInputElement>(':scope > input[type=file]')
	},
	async choose(...files: Array<File>) {
		const dataTransfer = new DataTransfer()
		files.forEach(file => dataTransfer.items.add(file))
		const input = this.input!
		input.files = dataTransfer.files
		input.dispatchEvent(new Event('change'))
		await settle()
	},
	async cancel() {
		this.input!.dispatchEvent(new Event('cancel'))
		await settle()
	},
}

@component('file-picker-test-component')
class FilePickerTestComponent extends Component {
	options: FilePickerOptions<boolean> = { handlePick: () => void 0 }

	protected override get template() {
		return html`<button ${filePicker(this.options)}></button>`
	}

	get trigger() { return this.renderRoot.querySelector('button')! }
}

@component('file-picker-controller-test-component')
class FilePickerControllerTestComponent extends Component {
	readonly handlePick = vi.fn()
	readonly filePicker = new FilePickerController(this, { handlePick: this.handlePick })
}

beforeEach(() => {
	vi.spyOn(HTMLInputElement.prototype, 'click').mockReturnValue(undefined)
})

afterEach(() => {
	dialog.input?.remove()
})

describe('FilePickerController', () => {
	const fixture = new ComponentTestFixture(() => new FilePickerControllerTestComponent())

	it('should open the file dialog when the host is clicked and hand over the chosen file', async () => {
		const file = createFile('a.txt')

		fixture.component.click()
		await dialog.choose(file)

		expect(fixture.component.handlePick).toHaveBeenCalledExactlyOnceWith(file)
	})

	it('should stop listening while the host is disconnected', () => {
		const component = fixture.component
		component.remove()

		component.click()

		expect(dialog.input).toBeNull()

		document.body.appendChild(component)
		component.click()

		expect(dialog.input).not.toBeNull()
	})
})

describe('filePicker', () => {
	function createFixture() {
		const fixture = new ComponentTestFixture(() => new FilePickerTestComponent())
		const handlePick: Mock<(selection: Array<File> | File) => unknown> = vi.fn()

		beforeEach(() => {
			handlePick.mockClear()
		})

		const use = async (options?: Partial<FilePickerOptions<boolean>>) => {
			fixture.component.options = { handlePick, ...options }
			await fixture.update()
			return fixture.component
		}

		return { fixture, handlePick, use }
	}

	describe('File dialog', () => {
		const { use } = createFixture()

		it('should not open before the element is clicked', async () => {
			await use()

			expect(dialog.input).toBeNull()
			expect(HTMLInputElement.prototype.click).not.toHaveBeenCalled()
		})

		it('should open on click through a hidden file input in the document', async () => {
			const { trigger } = await use()

			trigger.click()

			expect(dialog.input!.hidden).toBe(true)
			expect(HTMLInputElement.prototype.click).toHaveBeenCalledTimes(1)
			expect(vi.mocked(HTMLInputElement.prototype.click).mock.contexts[0]).toBe(dialog.input)
		})

		it('should offer a single file of any type by default', async () => {
			const { trigger } = await use()

			trigger.click()

			expect(dialog.input!.multiple).toBe(false)
			expect(dialog.input!.accept).toBe('')
		})

		it('should pass multiple and accept on to the dialog', async () => {
			const { trigger } = await use({ multiple: true, accept: 'image/*,.pdf' })

			trigger.click()

			expect(dialog.input!.multiple).toBe(true)
			expect(dialog.input!.accept).toBe('image/*,.pdf')
		})

		it('should remove the input once a file is chosen', async () => {
			const { trigger } = await use()

			trigger.click()
			await dialog.choose(createFile('a.txt'))

			expect(dialog.input).toBeNull()
		})

		it('should remove the input once the dialog is canceled', async () => {
			const { trigger } = await use()

			trigger.click()
			await dialog.cancel()

			expect(dialog.input).toBeNull()
		})

		it('should replace an input whose dialog never reported that it closed', async () => {
			const { trigger } = await use()

			trigger.click()
			const abandoned = dialog.input
			trigger.click()

			expect(abandoned!.isConnected).toBe(false)
			expect(document.body.querySelectorAll(':scope > input[type=file]').length).toBe(1)
		})
	})

	describe('Picking', () => {
		const { fixture, handlePick, use } = createFixture()

		it('should hand over the first file when several are chosen', async () => {
			const { trigger } = await use()
			const first = createFile('a.txt')

			trigger.click()
			await dialog.choose(first, createFile('b.txt'))

			expect(handlePick).toHaveBeenCalledExactlyOnceWith(first)
		})

		it('should hand over all files when multiple is set', async () => {
			const { trigger } = await use({ multiple: true })
			const files = [createFile('a.txt'), createFile('b.txt')]

			trigger.click()
			await dialog.choose(...files)

			expect(handlePick).toHaveBeenCalledExactlyOnceWith(files)
		})

		for (const { accept, expected } of [
			{ accept: '.pdf, .png', expected: ['a.pdf', 'b.PNG'] },
			{ accept: 'application/pdf', expected: ['a.pdf'] },
			{ accept: 'image/*', expected: ['b.PNG'] },
			{ accept: undefined, expected: ['a.pdf', 'b.PNG', 'c.txt'] },
		]) {
			it(`should filter the chosen files by accept "${accept}", as the dialog lets any file through`, async () => {
				const { trigger } = await use({ multiple: true, accept })

				trigger.click()
				await dialog.choose(createFile('a.pdf', 'application/pdf'), createFile('b.PNG', 'image/png'), createFile('c.txt'))

				expect((handlePick.mock.lastCall![0] as Array<File>).map(file => file.name)).toEqual(expected)
			})
		}

		it('should not call handlePick when no file passes the filter', async () => {
			const { trigger } = await use({ accept: '.csv' })

			trigger.click()
			await dialog.choose(createFile('a.txt'))

			expect(handlePick).not.toHaveBeenCalled()
		})

		it('should not call handlePick when the dialog is canceled', async () => {
			const { trigger } = await use()

			trigger.click()
			await dialog.cancel()

			expect(handlePick).not.toHaveBeenCalled()
		})

		it('should use the options of the latest render', async () => {
			const first = vi.fn()
			await use({ handlePick: first })
			const { trigger } = await use()

			trigger.click()
			await dialog.choose(createFile('a.txt'))

			expect(first).not.toHaveBeenCalled()
			expect(handlePick).toHaveBeenCalledTimes(1)
		})

		it('should hand over a file that is chosen after the element is gone, as a menu item is by then', async () => {
			const { trigger } = await use()
			const file = createFile('a.txt')

			trigger.click()
			fixture.component.remove()
			await dialog.choose(file)

			expect(handlePick).toHaveBeenCalledExactlyOnceWith(file)
		})
	})

	describe('Lifecycle', () => {
		const { fixture, use } = createFixture()

		it('should stop listening when the template disconnects and listen again when it reconnects', async () => {
			const { trigger } = await use()

			fixture.component.remove()
			trigger.click()

			expect(dialog.input).toBeNull()

			document.body.appendChild(fixture.component)
			await fixture.component.updateComplete
			trigger.click()

			expect(dialog.input).not.toBeNull()
		})
	})

	describe('Progress', () => {
		let finish: () => void
		const handlePick = vi.fn(() => new Promise<void>(resolve => finish = resolve))
		const fixture = new ComponentTestFixture<HTMLElementTagNameMap['mo-loading-button']>(html`
			<mo-loading-button ${filePicker({ handlePick })}>Import</mo-loading-button>
		`)

		beforeEach(async () => {
			handlePick.mockClear()
			await new Promise(resolve => setTimeout(resolve, 50))
		})

		describe('on a loading button', () => {
			it('should show the progress from the click until handlePick settles', async () => {
				await userEvent.click(fixture.component)

				expect(fixture.component.loading).toBe(true)

				await dialog.choose(createFile('a.txt'))

				expect(handlePick).toHaveBeenCalledTimes(1)
				expect(fixture.component.loading).toBe(true)

				finish()
				await settle()

				expect(fixture.component.loading).toBe(false)
			})

			it('should end the progress when the dialog is canceled', async () => {
				await userEvent.click(fixture.component)

				expect(fixture.component.loading).toBe(true)

				await dialog.cancel()

				expect(handlePick).not.toHaveBeenCalled()
				expect(fixture.component.loading).toBe(false)
			})

			it('should open the dialog once per click', async () => {
				await userEvent.click(fixture.component)

				expect(HTMLInputElement.prototype.click).toHaveBeenCalledTimes(1)

				await dialog.cancel()
			})
		})
	})
})
