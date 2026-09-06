import { component, Component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { fileDrop, FileDropController, type FileDropOptions } from './fileDrop.js'

function createFile(name: string, type = 'text/plain') {
	return new File(['content'], name, { type })
}

function createDragEvent(type: string, ...files: Array<File>) {
	const dataTransfer = new DataTransfer()
	files.forEach(file => dataTransfer.items.add(file))
	return withDataTransfer(type, dataTransfer)
}

function createTextDragEvent(type: string) {
	const dataTransfer = new DataTransfer()
	dataTransfer.setData('text/plain', 'not a file')
	return withDataTransfer(type, dataTransfer)
}

function withDataTransfer(type: string, dataTransfer: DataTransfer) {
	const event = new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer })
	if (!event.dataTransfer) {
		Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
	}
	return event
}

@component('file-drop-test-component')
class FileDropTestComponent extends Component {
	options: FileDropOptions<boolean> = { handleDrop: () => void 0 }

	protected override get template() {
		return html`<div ${fileDrop(this.options)}><span></span></div>`
	}

	get target() { return this.renderRoot.querySelector('div')! }
	get child() { return this.renderRoot.querySelector('span')! }
}

@component('file-drop-controller-test-component')
class FileDropControllerTestComponent extends Component {
	readonly handleDrop = jasmine.createSpy('handleDrop')
	readonly fileDrop = new FileDropController(this, { handleDrop: this.handleDrop })
}

describe('FileDropController', () => {
	const fixture = new ComponentTestFixture(() => new FileDropControllerTestComponent())

	it('should make the host accept dropped files without attaching by hand', () => {
		const file = createFile('a.txt')

		fixture.component.dispatchEvent(createDragEvent('drop', file))

		expect(fixture.component.handleDrop).toHaveBeenCalledOnceWith(file)
	})

	it('should stamp the host while files are dragged over it', () => {
		const file = createFile('a.txt')

		fixture.component.dispatchEvent(createDragEvent('dragenter', file))

		expect(fixture.component.hasAttribute('dragover')).toBeTrue()
		expect(fixture.component.fileDrop.dragover).toBeTrue()

		fixture.component.dispatchEvent(createDragEvent('dragleave', file))

		expect(fixture.component.hasAttribute('dragover')).toBeFalse()
	})

	it('should stop listening while the host is disconnected', () => {
		const component = fixture.component
		component.remove()

		component.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

		expect(component.handleDrop).not.toHaveBeenCalled()

		document.body.appendChild(component)
		component.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

		expect(component.handleDrop).toHaveBeenCalledTimes(1)
	})
})

describe('fileDrop', () => {
	const fixture = new ComponentTestFixture(() => new FileDropTestComponent())

	let handleDrop: jasmine.Spy
	let handleDragoverChange: jasmine.Spy

	beforeEach(() => {
		handleDrop = jasmine.createSpy('handleDrop')
		handleDragoverChange = jasmine.createSpy('handleDragoverChange')
	})

	const use = async (options?: Partial<FileDropOptions<boolean>>) => {
		fixture.component.options = { handleDrop, handleDragoverChange, ...options }
		await fixture.update()
		return fixture.component
	}

	describe('dragover', () => {
		it('should stamp the attribute on dragenter and clear it on dragleave', async () => {
			const { target } = await use()
			const file = createFile('a.txt')

			target.dispatchEvent(createDragEvent('dragenter', file))

			expect(target.hasAttribute('dragover')).toBeTrue()
			expect(handleDragoverChange).toHaveBeenCalledOnceWith(true)

			target.dispatchEvent(createDragEvent('dragleave', file))

			expect(target.hasAttribute('dragover')).toBeFalse()
			expect(handleDragoverChange).toHaveBeenCalledWith(false)
		})

		it('should stay stamped while the pointer crosses child elements', async () => {
			const { target, child } = await use()
			const file = createFile('a.txt')

			target.dispatchEvent(createDragEvent('dragenter', file))
			child.dispatchEvent(createDragEvent('dragenter', file))
			target.dispatchEvent(createDragEvent('dragleave', file))

			expect(target.hasAttribute('dragover')).toBeTrue()
			expect(handleDragoverChange).toHaveBeenCalledOnceWith(true)

			child.dispatchEvent(createDragEvent('dragleave', file))

			expect(target.hasAttribute('dragover')).toBeFalse()
		})

		it('should stamp the element it is placed on, not the host', async () => {
			const component = await use()

			component.target.dispatchEvent(createDragEvent('dragenter', createFile('a.txt')))

			expect(component.hasAttribute('dragover')).toBeFalse()
		})

		it('should ignore drags that carry no files', async () => {
			const { target } = await use()
			const dragover = createTextDragEvent('dragover')

			target.dispatchEvent(createTextDragEvent('dragenter'))
			target.dispatchEvent(dragover)

			expect(target.hasAttribute('dragover')).toBeFalse()
			expect(dragover.defaultPrevented).toBeFalse()
			expect(handleDragoverChange).not.toHaveBeenCalled()
		})

		it('should prevent the default of dragover so the drop is allowed', async () => {
			const { target } = await use()
			const event = createDragEvent('dragover', createFile('a.txt'))

			target.dispatchEvent(event)

			expect(event.defaultPrevented).toBeTrue()
		})
	})

	describe('drop', () => {
		it('should prevent the default and clear the attribute', async () => {
			const { target } = await use()
			const file = createFile('a.txt')
			target.dispatchEvent(createDragEvent('dragenter', file))
			const event = createDragEvent('drop', file)

			target.dispatchEvent(event)

			expect(event.defaultPrevented).toBeTrue()
			expect(target.hasAttribute('dragover')).toBeFalse()
		})

		it('should hand over the first file when several are dropped', async () => {
			const { target } = await use()
			const first = createFile('a.txt')

			target.dispatchEvent(createDragEvent('drop', first, createFile('b.txt')))

			expect(handleDrop).toHaveBeenCalledOnceWith(first)
		})

		it('should hand over all files when multiple is set', async () => {
			const { target } = await use({ multiple: true })
			const files = [createFile('a.txt'), createFile('b.txt')]

			target.dispatchEvent(createDragEvent('drop', ...files))

			expect(handleDrop).toHaveBeenCalledOnceWith(files)
		})

		for (const { accept, expected } of [
			{ accept: '.pdf, .png', expected: ['a.pdf', 'b.PNG'] },
			{ accept: 'application/pdf', expected: ['a.pdf'] },
			{ accept: 'image/*', expected: ['b.PNG'] },
			{ accept: undefined, expected: ['a.pdf', 'b.PNG', 'c.txt'] },
		]) {
			it(`should filter the dropped files by accept "${accept}"`, async () => {
				const { target } = await use({ multiple: true, accept })
				const files = [createFile('a.pdf', 'application/pdf'), createFile('b.PNG', 'image/png'), createFile('c.txt')]

				target.dispatchEvent(createDragEvent('drop', ...files))

				expect((handleDrop.calls.mostRecent().args[0] as Array<File>).map(file => file.name)).toEqual(expected)
			})
		}

		it('should not call handleDrop when no file passes the filter', async () => {
			const { target } = await use({ accept: '.csv' })

			target.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

			expect(handleDrop).not.toHaveBeenCalled()
		})

		it('should use the options of the latest render', async () => {
			const first = jasmine.createSpy('first')
			await use({ handleDrop: first })
			await use()

			fixture.component.target.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

			expect(first).not.toHaveBeenCalled()
			expect(handleDrop).toHaveBeenCalledTimes(1)
		})
	})

	it('should stop listening when the template disconnects and listen again when it reconnects', async () => {
		const { target } = await use()

		fixture.component.remove()
		target.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

		expect(handleDrop).not.toHaveBeenCalled()

		document.body.appendChild(fixture.component)
		await fixture.component.updateComplete
		target.dispatchEvent(createDragEvent('drop', createFile('a.txt')))

		expect(handleDrop).toHaveBeenCalledTimes(1)
	})
})