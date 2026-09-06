import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType, type ReactiveController, type ReactiveElement } from '@a11d/lit'
import { type FileUploadSelection } from './FileUpload.js'

export type FileDropOptions<TMultiple extends boolean = false> = {
	readonly multiple?: TMultiple
	/** As the "accept" attribute of a file input. */
	readonly accept?: string
	handleDrop(selection: NonNullable<FileUploadSelection<TMultiple>>): void
	handleDragoverChange?(dragover: boolean): void
}

/** Makes an element accept dropped files, stamping a "dragover" attribute on it while files are dragged over it. */
class FileDropTarget<TMultiple extends boolean = false> implements EventListenerObject {
	private static readonly eventTypes = ['dragenter', 'dragover', 'dragleave', 'drop']

	static accepts(file: File, accept?: string) {
		const tokens = accept?.split(',').map(token => token.trim().toLowerCase()).filter(Boolean) ?? []
		const name = file.name.toLowerCase()
		const type = file.type.toLowerCase()
		return tokens.length === 0 || tokens.some(token => {
			if (token.startsWith('.')) {
				return name.endsWith(token)
			}
			if (token.endsWith('/*')) {
				return type.startsWith(token.slice(0, -1))
			}
			return type === token
		})
	}

	private readonly resolveOptions: () => FileDropOptions<TMultiple>

	constructor(options: FileDropOptions<TMultiple> | (() => FileDropOptions<TMultiple>)) {
		this.resolveOptions = typeof options === 'function' ? options : () => options
	}

	protected get options() { return this.resolveOptions() }

	private _element?: HTMLElement
	get element() { return this._element }

	private _dragover = false
	get dragover() { return this._dragover }

	private depth = 0

	attach(element: HTMLElement) {
		if (this._element !== element) {
			this.detach()
			this._element = element
			for (const type of FileDropTarget.eventTypes) {
				element.addEventListener(type, this)
			}
		}
	}

	detach() {
		if (this._element) {
			for (const type of FileDropTarget.eventTypes) {
				this._element.removeEventListener(type, this)
			}
			this.depth = 0
			this.setDragover(false)
			this._element = undefined
		}
	}

	handleEvent(event: DragEvent) {
		if (!event.dataTransfer?.types.includes('Files')) {
			return
		}

		switch (event.type) {
			case 'dragenter':
				this.depth++
				this.setDragover(true)
				break
			case 'dragover':
				event.preventDefault()
				event.dataTransfer.dropEffect = 'copy'
				break
			case 'dragleave':
				this.depth--
				if (this.depth <= 0) {
					this.depth = 0
					this.setDragover(false)
				}
				break
			case 'drop':
				event.preventDefault()
				this.depth = 0
				this.setDragover(false)
				this.drop([...event.dataTransfer.files])
				break
		}
	}

	protected drop(files: Array<File>) {
		const options = this.options
		const accepted = files.filter(file => FileDropTarget.accepts(file, options.accept))
		if (accepted.length > 0) {
			const selection = options.multiple ? accepted : accepted[0]
			options.handleDrop(selection as NonNullable<FileUploadSelection<TMultiple>>)
		}
	}

	protected setDragover(dragover: boolean) {
		if (this._dragover !== dragover) {
			this._dragover = dragover
			this._element?.toggleAttribute('dragover', dragover)
			this.options.handleDragoverChange?.(dragover)
		}
	}
}

export class FileDropController<TMultiple extends boolean = false> extends FileDropTarget<TMultiple> implements ReactiveController {
	constructor(private readonly host: ReactiveElement, options: FileDropOptions<TMultiple> | (() => FileDropOptions<TMultiple>)) {
		super(options)
		host.addController(this)
	}

	hostConnected() {
		this.attach(this.host)
	}

	hostDisconnected() {
		this.detach()
	}
}

class FileDropDirective extends AsyncDirective {
	protected readonly element: HTMLElement
	protected options?: FileDropOptions<boolean>
	protected readonly target = new FileDropTarget<boolean>(() => this.options!)

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('fileDrop can only be used on an element')
		}

		this.element = (partInfo as ElementPart).element as HTMLElement
	}

	render(options: FileDropOptions<boolean>) {
		this.options = options
		this.target.attach(this.element)
	}

	protected override disconnected() {
		this.target.detach()
	}

	protected override reconnected() {
		this.target.attach(this.element)
	}
}

const fileDropDirective = directive(FileDropDirective)

/** Makes the element accept dropped files, e.g. `<mo-card ${fileDrop({ accept: 'image/*', handleDrop: file => this.attach(file) })}>`. */
export const fileDrop = <TMultiple extends boolean = false>(options: FileDropOptions<TMultiple>) => fileDropDirective(options)