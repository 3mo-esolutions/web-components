import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type FileUpload } from '@3mo/file-upload'
import { type FileUploadDropArea } from './FileUploadDropArea.js'
import './index.js'

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

	function createFixture<TMultiple extends boolean>({ multiple, accept }: { multiple?: TMultiple, accept?: string } = {}) {
		const upload = jasmine.createSpy('upload').and.resolveTo('result')
		const fixture = new ComponentTestFixture<FileUploadDropArea<string, TMultiple>>(html`
			<mo-file-upload-drop-area .upload=${upload} ?multiple=${multiple} .accept=${accept}></mo-file-upload-drop-area>
		`)
		beforeEach(() => upload.calls.reset())
		return {
			fixture,
			upload,
			get component() { return fixture.component },
			get uploadElement() { return fixture.component.renderRoot.querySelector('mo-file-upload') as FileUpload<string, TMultiple> },
			get selection() { return upload.calls.mostRecent().args[0] },
		}
	}

	describe('inner file upload', () => {
		const test = createFixture({ multiple: true, accept: 'image/*' })

		it('should render a mo-file-upload with uploadOnSelection that tunnels upload, multiple and accept', () => {
			expect(test.uploadElement).not.toBeNull()
			expect(test.uploadElement.uploadOnSelection).toBeTrue()
			expect(test.uploadElement.upload).toBe(test.component.upload)
			expect(test.uploadElement.multiple).toBeTrue()
			expect(test.uploadElement.accept).toBe('image/*')
		})

		for (const { event, detail } of [
			{ event: 'change', detail: 'result' },
			{ event: 'uploadingChange', detail: true },
			{ event: 'selectionChange', detail: 'a.txt' },
		]) {
			it(`should re-dispatch ${event} from the inner upload`, () => {
				const dispatch = jasmine.createSpy(event)
				test.component.addEventListener(event, (e: Event) => dispatch((e as CustomEvent).detail))

				test.uploadElement.dispatchEvent(new CustomEvent(event, { detail }))

				expect(dispatch).toHaveBeenCalledOnceWith(detail)
			})
		}
	})

	describe('delegation', () => {
		const test = createFixture()

		for (const { method, args } of [
			{ method: 'openExplorer', args: [] as Array<any> },
			{ method: 'uploadSelection', args: [createFile('a.txt')] as Array<any> },
			{ method: 'executeUpload', args: [() => Promise.resolve('result')] as Array<any> },
		]) {
			it(`should forward ${method} to the inner upload`, () => {
				const component = test.component as any
				const spy = spyOn(test.uploadElement as any, method)

				component[method](...args)

				expect(spy).toHaveBeenCalledWith(...args)
			})
		}

		it('should open the file explorer when the area is clicked', () => {
			const spy = spyOn(test.uploadElement, 'openExplorer')

			test.component.click()

			expect(spy).toHaveBeenCalled()
		})
	})

	describe('drag and drop', () => {
		const single = createFixture()
		const multiple = createFixture({ multiple: true })

		it('should set the "drag" attribute on dragover and remove it on dragleave', () => {
			single.component.dispatchEvent(createDragEvent('dragover'))
			expect(single.component.hasAttribute('drag')).toBeTrue()

			single.component.dispatchEvent(createDragEvent('dragleave'))
			expect(single.component.hasAttribute('drag')).toBeFalse()
		})

		it('should remove the "drag" attribute on drop', async () => {
			single.component.dispatchEvent(createDragEvent('dragover'))
			expect(single.component.hasAttribute('drag')).toBeTrue()

			single.component.dispatchEvent(createDragEvent('drop', createDataTransfer(createFile('a.txt'))))
			await settle()

			expect(single.component.hasAttribute('drag')).toBeFalse()
		})

		it('should prevent the browser\'s default open-file behavior on dragover and drop', async () => {
			const dragover = createDragEvent('dragover')
			single.component.dispatchEvent(dragover)
			expect(dragover.defaultPrevented).toBeTrue()

			const drop = createDragEvent('drop', createDataTransfer(createFile('a.txt')))
			single.component.dispatchEvent(drop)
			await settle()

			expect(drop.defaultPrevented).toBeTrue()
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
	})
})