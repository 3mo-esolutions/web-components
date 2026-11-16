import { AsyncDirective, directive, type ElementPart, type PartInfo, PartType, type ReactiveController, type ReactiveElement } from '@a11d/lit'
import { type FileUploadSelection } from './FileUpload.js'
import { accepts } from './accepts.js'

export type FilePickerOptions<TMultiple extends boolean = false> = {
	readonly multiple?: TMultiple
	/** As the "accept" attribute of a file input. */
	readonly accept?: string
	/** The click listener returns what this returns, so a `mo-loading-button` shows its progress until a returned promise settles. */
	handlePick(selection: NonNullable<FileUploadSelection<TMultiple>>): unknown
}

/** Makes an element open the file dialog when clicked, handing over the files chosen in it. */
class FilePickerTrigger<TMultiple extends boolean = false> {
	private readonly resolveOptions: () => FilePickerOptions<TMultiple>

	constructor(options: FilePickerOptions<TMultiple> | (() => FilePickerOptions<TMultiple>)) {
		this.resolveOptions = typeof options === 'function' ? options : () => options
	}

	protected get options() { return this.resolveOptions() }

	private _element?: HTMLElement
	get element() { return this._element }

	private input?: HTMLInputElement

	attach(element: HTMLElement) {
		if (this._element !== element) {
			this.detach()
			this._element = element
			element.addEventListener('click', this.handleClick)
		}
	}

	/** Leaves an open dialog alone: its files still arrive, as a menu item is gone by the time they are chosen. */
	detach() {
		this._element?.removeEventListener('click', this.handleClick)
		this._element = undefined
	}

	private readonly handleClick = async () => {
		const options = this.options
		const files = await this.choose(options)
		const accepted = files.filter(file => accepts(file, options.accept))
		if (accepted.length > 0) {
			const selection = options.multiple ? accepted : accepted[0]
			await options.handlePick(selection as NonNullable<FileUploadSelection<TMultiple>>)
		}
	}

	protected choose({ multiple, accept }: FilePickerOptions<TMultiple>) {
		// Settles a dialog the browser never reported as closed
		this.input?.dispatchEvent(new Event('cancel'))
		const input = this.input = document.createElement('input')
		input.type = 'file'
		input.hidden = true
		input.multiple = !!multiple
		input.accept = accept ?? ''
		return new Promise<Array<File>>(resolve => {
			const settle = () => {
				input.remove()
				resolve([...input.files ?? []])
			}
			input.addEventListener('change', settle, { once: true })
			input.addEventListener('cancel', settle, { once: true })
			// In the document rather than in the element, which may be gone before the files are chosen
			document.body.append(input)
			input.click()
		})
	}
}

export class FilePickerController<TMultiple extends boolean = false> extends FilePickerTrigger<TMultiple> implements ReactiveController {
	constructor(private readonly host: ReactiveElement, options: FilePickerOptions<TMultiple> | (() => FilePickerOptions<TMultiple>)) {
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

class FilePickerDirective extends AsyncDirective {
	protected readonly element: HTMLElement
	protected options?: FilePickerOptions<boolean>
	protected readonly trigger = new FilePickerTrigger<boolean>(() => this.options!)

	constructor(partInfo: PartInfo) {
		super(partInfo)

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('filePicker can only be used on an element')
		}

		this.element = (partInfo as ElementPart).element as HTMLElement
	}

	render(options: FilePickerOptions<boolean>) {
		this.options = options
		this.trigger.attach(this.element)
	}

	protected override disconnected() {
		this.trigger.detach()
	}

	protected override reconnected() {
		this.trigger.attach(this.element)
	}
}

const filePickerDirective = directive(FilePickerDirective)

/** Makes the element open the file dialog when clicked, e.g. `<mo-button ${filePicker({ accept: '.csv', handlePick: file => this.import(file) })}>`. */
export const filePicker = <TMultiple extends boolean = false>(options: FilePickerOptions<TMultiple>) => filePickerDirective(options)
