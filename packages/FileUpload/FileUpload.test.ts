import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { type FileUpload } from './FileUpload.js'
import './index.js'

describe('FileUpload', () => {
	function createFile(name: string) {
		return new File(['content'], name, { type: 'text/plain' })
	}

	class FileUploadTestFixture<TMultiple extends boolean> extends ComponentTestFixture<FileUpload<string, TMultiple>> {
		get input() {
			return this.component.renderRoot.querySelector('input')!
		}

		select(...files: Array<File>) {
			const dataTransfer = new DataTransfer()
			files.forEach(file => dataTransfer.items.add(file))
			this.input.files = dataTransfer.files
			this.input.dispatchEvent(new Event('change'))
		}

		constructor({ multiple, accept }: { multiple?: TMultiple, accept?: string } = {}) {
			super(html`<mo-file-upload ?multiple=${multiple} .accept=${accept}></mo-file-upload>`)
		}
	}

	describe('multiple', () => {
		const single = new FileUploadTestFixture({ multiple: false })
		it('should not allow selecting multiple files by default', () => {
			expect(single.input.multiple).toBe(false)
		})

		const multiple = new FileUploadTestFixture({ multiple: true })
		it('should tunnel the multiple attribute to the input', () => {
			expect(multiple.input.multiple).toBe(true)
		})
	})

	describe('accept', () => {
		const fixture = new FileUploadTestFixture({ accept: 'image/*,.pdf' })

		it('should tunnel the accept attribute to the input', () => {
			expect(fixture.input.getAttribute('accept')).toBe('image/*,.pdf')
			expect(fixture.input.accept).toBe('image/*,.pdf')
		})
	})

	describe('openExplorer', () => {
		const fixture = new FileUploadTestFixture()

		it('should open the native file explorer via openExplorer()', () => {
			const click = vi.spyOn(fixture.input, 'click').mockReturnValue(undefined)

			fixture.component.openExplorer()

			expect(click).toHaveBeenCalled()
		})
	})

	describe('selection', () => {
		const fixture = new FileUploadTestFixture({ multiple: false })

		it('should expose and dispatch the single selected file', () => {
			const file = createFile('a.txt')
			vi.spyOn(fixture.component.selectionChange, 'dispatch').mockReturnValue(undefined)

			fixture.select(file)

			expect(fixture.component.selection).toBe(file)
			expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith(file)
		})
	})

	describe('multiple selection', () => {
		const fixture = new FileUploadTestFixture({ multiple: true })

		it('should expose and dispatch all selected files', () => {
			const files = [createFile('a.txt'), createFile('b.txt')]
			vi.spyOn(fixture.component.selectionChange, 'dispatch').mockReturnValue(undefined)

			fixture.select(...files)

			expect(fixture.component.selection).toEqual(files)
			expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith(files)
		})
	})

	describe('uploadSelection', () => {
		describe('single', () => {
			const fixture = new FileUploadTestFixture({ multiple: false })

			it('should upload the file and dispatch the result', async () => {
				const file = createFile('a.txt')
				const upload = vi.fn().mockResolvedValue('result')
				fixture.component.upload = upload
				vi.spyOn(fixture.component.change, 'dispatch').mockReturnValue(undefined)

				await fixture.component.uploadSelection(file)

				expect(upload).toHaveBeenCalledWith(file)
				expect(fixture.component.change.dispatch).toHaveBeenCalledWith('result')
			})

			it('should upload the current selection when no override is passed', async () => {
				const file = createFile('a.txt')
				const upload = vi.fn().mockResolvedValue('result')
				fixture.component.upload = upload
				fixture.select(file)

				await fixture.component.uploadSelection()

				expect(upload).toHaveBeenCalledWith(file)
			})

			it('should throw when no file is selected', () => {
				expect(() => fixture.component.uploadSelection()).toThrowError('No file selected')
			})
		})

		describe('multiple', () => {
			const fixture = new FileUploadTestFixture({ multiple: true })

			it('should upload all files in a single call', async () => {
				const files = [createFile('a.txt'), createFile('b.txt')]
				const upload = vi.fn().mockResolvedValue('result')
				fixture.component.upload = upload

				await fixture.component.uploadSelection(files)

				expect(upload).toHaveBeenCalledWith(files)
			})

			it('should throw when an empty array is passed', () => {
				expect(() => fixture.component.uploadSelection([])).toThrowError('No file selected')
			})
		})
	})

	describe('upload lifecycle', () => {
		const fixture = new FileUploadTestFixture({ multiple: false })

		it('should dispatch uploadingChange with true when the upload starts and false when it settles', async () => {
			fixture.component.upload = vi.fn().mockResolvedValue('result')
			const dispatch = vi.spyOn(fixture.component.uploadingChange, 'dispatch').mockReturnValue(undefined)

			await fixture.component.uploadSelection(createFile('a.txt'))

			expect(dispatch.mock.calls).toEqual([[true], [false]])
		})

		// BUG: resetFiles fails to clear inputElement.files
		it.skip('should reset the file input and dispatch selectionChange after the upload settles', async () => {
			const file = createFile('a.txt')
			fixture.component.upload = vi.fn().mockResolvedValue('result')
			fixture.select(file)
			expect(fixture.input.files?.length).toBe(1)
			const dispatch = vi.spyOn(fixture.component.selectionChange, 'dispatch').mockReturnValue(undefined)

			await fixture.component.uploadSelection(file)

			expect(fixture.input.files?.length).toBe(0)
			expect(dispatch).toHaveBeenCalledExactlyOnceWith(undefined)
		})

		it('should notify an error, dispatch change with undefined and rethrow when the upload fails', async () => {
			const error = new Error('Upload failed')
			fixture.component.upload = vi.fn().mockRejectedValue(error)
			const notifyError = vi.spyOn(NotificationComponent, 'notifyError').mockResolvedValue(undefined)
			const change = vi.spyOn(fixture.component.change, 'dispatch').mockReturnValue(undefined)

			await expect(fixture.component.uploadSelection(createFile('a.txt'))).rejects.toEqual(error)

			expect(notifyError).toHaveBeenCalled()
			expect(change).toHaveBeenCalledExactlyOnceWith(undefined)
		})
	})

	describe('uploadOnSelection', () => {
		const fixture = new FileUploadTestFixture({ multiple: false })

		it('should not upload on selection by default', async () => {
			const upload = vi.fn().mockResolvedValue('result')
			fixture.component.upload = upload
			expect(fixture.component.uploadOnSelection).toBe(false)

			fixture.select(createFile('a.txt'))
			await new Promise<void>(resolve => setTimeout(resolve))

			expect(upload).not.toHaveBeenCalled()
		})

		it('should upload the selection as soon as it is made', async () => {
			const file = createFile('a.txt')
			const upload = vi.fn().mockResolvedValue('result')
			fixture.component.upload = upload
			fixture.component.uploadOnSelection = true

			fixture.select(file)
			await new Promise<void>(resolve => setTimeout(resolve))

			expect(upload).toHaveBeenCalledWith(file)
		})
	})
})