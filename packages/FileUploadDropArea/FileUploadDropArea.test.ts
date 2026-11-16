import { html } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { userEvent } from 'vitest/browser'
import { FileUploadDropArea } from './FileUploadDropArea.js'
import './index.js'

class TestFileUploadDropArea extends FileUploadDropArea<string> {
	override uploadSelection(selection: File) {
		return super.uploadSelection(selection)
	}
}

customElements.define('test-file-upload-drop-area', TestFileUploadDropArea)

describe('FileUploadDropArea', () => {
	const createFile = (name: string) => new File(['content'], name, { type: 'text/plain' })

	const createDataTransfer = (...items: Array<File | string>) => {
		const dataTransfer = new DataTransfer()
		for (const item of items) {
			typeof item === 'string' ? dataTransfer.items.add(item, 'text/plain') : dataTransfer.items.add(item)
		}
		return dataTransfer
	}

	// Firefox has not always honored `dataTransfer` in `DragEventInit`, so it is shadowed onto the instance if it did not stick.
	const createDragEvent = (type: string, dataTransfer?: DataTransfer) => {
		const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer })
		if (dataTransfer && event.dataTransfer !== dataTransfer) {
			Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
		}
		return event
	}

	const settle = () => new Promise<void>(resolve => setTimeout(resolve))

	/** Stands in for the file dialog, which no spec can operate: the input is never really clicked. */
	const dialog = {
		get input() {
			return document.body.querySelector<HTMLInputElement>(':scope > input[type=file]')
		},
		async choose(...files: Array<File>) {
			const input = this.input!
			input.files = createDataTransfer(...files).files
			input.dispatchEvent(new Event('change'))
			await settle()
		},
	}

	beforeEach(() => {
		vi.spyOn(HTMLInputElement.prototype, 'click').mockReturnValue(undefined)
	})

	afterEach(() => {
		dialog.input?.remove()
	})

	function createFixture<TMultiple extends boolean>({ multiple, accept }: { multiple?: TMultiple, accept?: string } = {}) {
		const upload = vi.fn().mockResolvedValue('result')
		const fixture = new ComponentTestFixture<FileUploadDropArea<string, TMultiple>>(html`
			<mo-file-upload-drop-area .upload=${upload} ?multiple=${multiple} .accept=${accept}></mo-file-upload-drop-area>
		`)
		beforeEach(() => {
			upload.mockReset().mockResolvedValue('result')
		})
		return {
			fixture,
			upload,
			get component() { return fixture.component },
			get button() { return fixture.component.renderRoot.querySelector('button')! },
			get hint() { return fixture.component.renderRoot.querySelector('#hint')! },
			get selection() { return upload.mock.lastCall![0] },
		}
	}

	describe('Content', () => {
		describe('without slotted content', () => {
			const single = createFixture()
			const multiple = createFixture({ multiple: true })

			it('should show an icon and a hint asking for one file', () => {
				expect(single.hint.querySelector('mo-icon')).not.toBeNull()
				expect(single.hint.textContent.trim()).toBe('Drop a file here or click to choose one')
			})

			it('should word the hint for several files when multiple', () => {
				expect(multiple.hint.textContent.trim()).toBe('Drop files here or click to choose them')
			})
		})

		describe('with slotted content', () => {
			const fixture = new ComponentTestFixture<FileUploadDropArea<string>>(html`
				<mo-file-upload-drop-area><span id='own'>Drop the invoice here</span></mo-file-upload-drop-area>
			`)

			it('should show it in place of the hint', () => {
				const slot = fixture.component.renderRoot.querySelector('slot')!

				expect(slot.assignedElements({ flatten: true }).map(element => element.id)).toEqual(['own'])
			})
		})
	})

	describe('Button', () => {
		const test = createFixture()

		it('should fill the area with a button named by the content', () => {
			expect(test.button.type).toBe('button')
			expect(test.button.part.contains('button')).toBe(true)
			expect(test.button.textContent.trim()).toBe('Drop a file here or click to choose one')
		})

		it('should be reached by the keyboard and open the file dialog on Enter', async () => {
			await userEvent.tab()

			expect(test.component.shadowRoot!.activeElement).toBe(test.button)

			await userEvent.keyboard('{Enter}')

			expect(dialog.input).not.toBeNull()
		})
	})

	describe('Picking', () => {
		const single = createFixture()
		const multiple = createFixture({ multiple: true, accept: '.txt' })

		it('should open the file dialog when the area is clicked', async () => {
			await userEvent.click(single.component)

			expect(HTMLInputElement.prototype.click).toHaveBeenCalledTimes(1)
			expect(dialog.input!.multiple).toBe(false)
			expect(dialog.input!.accept).toBe('')
		})

		it('should pass multiple and accept on to the file dialog', async () => {
			await userEvent.click(multiple.component)

			expect(dialog.input!.multiple).toBe(true)
			expect(dialog.input!.accept).toBe('.txt')
		})

		it('should upload the chosen file', async () => {
			const file = createFile('a.txt')

			await userEvent.click(single.component)
			await dialog.choose(file)

			expect(single.upload).toHaveBeenCalledExactlyOnceWith(file)
		})

		it('should upload all chosen files as an array when multiple', async () => {
			const files = [createFile('a.txt'), createFile('b.txt')]

			await userEvent.click(multiple.component)
			await dialog.choose(...files)

			expect(multiple.upload).toHaveBeenCalledExactlyOnceWith(files)
		})
	})

	describe('Drag and drop', () => {
		const single = createFixture()
		const multiple = createFixture({ multiple: true })
		const filtered = createFixture({ accept: '.csv' })

		it('should stamp the "dragover" attribute on dragenter and remove it on dragleave', () => {
			single.component.dispatchEvent(createDragEvent('dragenter', createDataTransfer(createFile('a.txt'))))
			expect(single.component.hasAttribute('dragover')).toBe(true)

			single.component.dispatchEvent(createDragEvent('dragleave', createDataTransfer(createFile('a.txt'))))
			expect(single.component.hasAttribute('dragover')).toBe(false)
		})

		it('should keep the "dragover" attribute while the pointer crosses slotted children', () => {
			const dataTransfer = createDataTransfer(createFile('a.txt'))
			const child = single.component.appendChild(document.createElement('span'))

			single.component.dispatchEvent(createDragEvent('dragenter', dataTransfer))
			child.dispatchEvent(createDragEvent('dragenter', dataTransfer))
			single.component.dispatchEvent(createDragEvent('dragleave', dataTransfer))

			expect(single.component.hasAttribute('dragover')).toBe(true)

			child.dispatchEvent(createDragEvent('dragleave', dataTransfer))

			expect(single.component.hasAttribute('dragover')).toBe(false)
			child.remove()
		})

		it('should ignore a drag that carries no files', () => {
			const dragover = createDragEvent('dragover', createDataTransfer('some text'))

			single.component.dispatchEvent(createDragEvent('dragenter', createDataTransfer('some text')))
			single.component.dispatchEvent(dragover)

			expect(single.component.hasAttribute('dragover')).toBe(false)
			expect(dragover.defaultPrevented).toBe(false)
		})

		it('should remove the "dragover" attribute on drop', async () => {
			single.component.dispatchEvent(createDragEvent('dragenter', createDataTransfer(createFile('a.txt'))))
			expect(single.component.hasAttribute('dragover')).toBe(true)

			single.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'))))
			await settle()

			expect(single.component.hasAttribute('dragover')).toBe(false)
		})

		it('should prevent the browser\'s default open-file behavior on dragover and drop', async () => {
			const dragover = createDragEvent('dragover', createDataTransfer(createFile('a.txt')))
			single.component.dispatchEvent(dragover)
			expect(dragover.defaultPrevented).toBe(true)

			const drop = createDragEvent('drop', createDataTransfer(createFile('a.txt')))
			single.component.dispatchEvent(drop)
			await settle()

			expect(drop.defaultPrevented).toBe(true)
		})

		it('should upload the single dropped file by default', async () => {
			single.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'), createFile('b.txt'))))
			await settle()

			expect(single.upload).toHaveBeenCalledTimes(1)
			expect((single.selection as File).name).toBe('a.txt')
		})

		it('should upload all dropped files as an array when multiple', async () => {
			multiple.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'), createFile('b.txt'))))
			await settle()

			expect(multiple.upload).toHaveBeenCalledTimes(1)
			expect((multiple.selection as Array<File>).map(file => file.name)).toEqual(['a.txt', 'b.txt'])
		})

		it('should ignore non-file items in the drop payload', async () => {
			multiple.component.dispatchEvent(createDragEvent('drop', createDataTransfer('some text', createFile('a.txt'))))
			await settle()

			expect((multiple.selection as Array<File>).map(file => file.name)).toEqual(['a.txt'])
		})

		it('should not upload a dropped file that accept rejects', async () => {
			filtered.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'))))
			await settle()

			expect(filtered.upload).not.toHaveBeenCalled()
		})
	})

	describe('Upload', () => {
		describe('while it is pending', () => {
			const test = createFixture()
			let finish: (result: string) => void

			beforeEach(async () => {
				test.upload.mockReturnValue(new Promise<string>(resolve => finish = resolve))
				test.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'))))
				await test.fixture.updateComplete
			})

			afterEach(async () => {
				finish('result')
				await settle()
			})

			it('should reflect "loading" and drop it once the upload settles', async () => {
				expect(test.component.hasAttribute('loading')).toBe(true)

				finish('result')
				await settle()
				await test.fixture.updateComplete

				expect(test.component.hasAttribute('loading')).toBe(false)
			})

			it('should disable the button and ignore the pointer', () => {
				expect(test.button.disabled).toBe(true)
				expect(getComputedStyle(test.component).pointerEvents).toBe('none')
			})

			it('should show a progress and say that it is uploading', () => {
				expect(test.hint.querySelector('mo-circular-progress')).not.toBeNull()
				expect(test.hint.querySelector('mo-icon')).toBeNull()
				expect(test.hint.textContent.trim()).toBe('Uploading…')
			})
		})

		describe('when it succeeds', () => {
			const test = createFixture()

			it('should dispatch change with the result', async () => {
				const change = vi.fn()
				test.component.addEventListener('change', (e: Event) => change((e as CustomEvent).detail))

				test.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'))))
				await settle()

				expect(change).toHaveBeenCalledExactlyOnceWith('result')
			})
		})

		describe('when it fails', () => {
			const fixture = new ComponentTestFixture(() => new TestFileUploadDropArea())

			it('should notify an error, dispatch change with undefined, stop loading and pass the error on', async () => {
				const error = new Error('Upload failed')
				fixture.component.upload = vi.fn().mockRejectedValue(error)
				const notifyError = vi.spyOn(NotificationComponent, 'notifyError').mockResolvedValue(undefined)
				const change = vi.spyOn(fixture.component.change, 'dispatch')

				await expect(fixture.component.uploadSelection(createFile('a.txt'))).rejects.toEqual(error)
				await fixture.updateComplete

				expect(notifyError).toHaveBeenCalled()
				expect(change).toHaveBeenCalledExactlyOnceWith(undefined)
				expect(fixture.component.hasAttribute('loading')).toBe(false)
			})
		})
	})
})
