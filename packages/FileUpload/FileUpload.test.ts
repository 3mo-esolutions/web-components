import { ComponentTestFixture } from '@a11d/lit-testing'
import { html } from '@a11d/lit'
import { type FileUpload } from './FileUpload.js'

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

		constructor({ multiple }: { multiple?: TMultiple }) {
			super(html`<mo-file-upload ?multiple=${multiple}></mo-file-upload>`)
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

	describe('selection', () => {
		const fixture = new FileUploadTestFixture({ multiple: false })

		it('should expose and dispatch the single selected file', () => {
			const file = createFile('a.txt')
			spyOn(fixture.component.selectionChange, 'dispatch')

			fixture.select(file)

			expect(fixture.component.selection).toBe(file)
			expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith(file)
		})
	})

	describe('multiple selection', () => {
		const fixture = new FileUploadTestFixture({ multiple: true })

		it('should expose and dispatch all selected files', () => {
			const files = [createFile('a.txt'), createFile('b.txt')]
			spyOn(fixture.component.selectionChange, 'dispatch')

			fixture.select(...files)

			expect(fixture.component.selection).toEqual(files)
			expect(fixture.component.selectionChange.dispatch).toHaveBeenCalledWith(files)
		})
	})

	describe('uploadFile', () => {
		describe('single', () => {
			const fixture = new FileUploadTestFixture({ multiple: false })

			it('should upload the file and dispatch the result', async () => {
				const file = createFile('a.txt')
				const upload = jasmine.createSpy('upload').and.resolveTo('result')
				fixture.component.upload = upload
				spyOn(fixture.component.change, 'dispatch')

				await fixture.component.uploadSelection(file)

				expect(upload).toHaveBeenCalledWith(file)
				expect(fixture.component.change.dispatch).toHaveBeenCalledWith('result')
			})

			it('should throw when no file is selected', () => {
				expect(() => fixture.component.uploadSelection()).toThrowError('No file selected')
			})
		})

		describe('multiple', () => {
			const fixture = new FileUploadTestFixture({ multiple: true })

			it('should upload all files in a single call', async () => {
				const files = [createFile('a.txt'), createFile('b.txt')]
				const upload = jasmine.createSpy('upload').and.resolveTo('result')
				fixture.component.upload = upload

				await fixture.component.uploadSelection(files)

				expect(upload).toHaveBeenCalledWith(files)
			})
		})
	})
})