import { html, eventListener, css, component, query, Component, property, event, literal, staticHtml, ifDefined } from '@a11d/lit'
import { type FileUpload, type FileUploadSelection } from '@3mo/file-upload'

/**
 * @element mo-file-upload-drop-area UploadDropArea is a component that allows the user to upload files by dragging them into the component.
 *
 * @attr upload - The mandatory upload function that is called when the user selects one or more files.
 * @attr multiple - Whether multiple files can be selected at once.
 * @attr accept - The file types that are accepted for upload, specified as a string containing a comma-separated list of MIME types or file extensions.
 *
 * @fires change - Dispatched when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed.
 * @fires uploadingChange - Dispatched when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise.
 * @fires selectionChange - Dispatched when the selection changes. The event detail is the selected file (or array of files when "multiple" is set) or undefined if no file is selected.
 */
@component('mo-file-upload-drop-area')
export class FileUploadDropArea<TResult, TMultiple extends boolean = false> extends Component {
	@event() readonly change!: EventDispatcher<TResult | undefined>
	@event() readonly uploadingChange!: EventDispatcher<boolean>
	@event() readonly selectionChange!: EventDispatcher<FileUploadSelection<TMultiple>>

	@property({ type: Object }) upload!: (selection: FileUploadSelection<TMultiple>) => Promise<TResult>
	@property({ type: Boolean }) multiple?: TMultiple | boolean
	@property() accept?: string

	@query('mo-file-upload') protected readonly uploadElement!: FileUpload<TResult, TMultiple>

	protected readonly fileUploadElementTag = literal`mo-file-upload`

	openExplorer(...parameters: Parameters<FileUpload<TResult, TMultiple>['openExplorer']>) {
		return this.uploadElement.openExplorer(...parameters)
	}

	uploadSelection(...parameters: Parameters<FileUpload<TResult, TMultiple>['uploadSelection']>) {
		return this.uploadElement.uploadSelection(...parameters)
	}

	executeUpload(...parameters: Parameters<FileUpload<TResult, TMultiple>['executeUpload']>) {
		return this.uploadElement.executeUpload(...parameters)
	}

	static override get styles() {
		return css`
			:host {
				cursor: pointer;
				display: block;
				border: 2px var(--mo-color-transparent-gray-3) dashed;
				padding: 20px;
				transition: 250ms;
			}

			:host([drag]) {
				border-color: var(--mo-color-accent);
				background: var(--mo-color-accent-transparent);
			}
		`
	}

	protected override get template() {
		return html`
			${this.fileUploadTemplate}
			${this.slotTemplate}
		`
	}

	protected get fileUploadTemplate() {
		return staticHtml`
			<${this.fileUploadElementTag} uploadOnSelection
				.upload=${this.upload}
				?multiple=${this.multiple}
				accept=${ifDefined(this.accept)}
				@change=${(e: CustomEvent<TResult | undefined>) => this.change.dispatch(e.detail)}
				@uploadingChange=${(e: CustomEvent<boolean>) => this.uploadingChange.dispatch(e.detail)}
				@selectionChange=${(e: CustomEvent<FileUploadSelection<TMultiple>>) => this.selectionChange.dispatch(e.detail)}
			></${this.fileUploadElementTag}>
		`
	}

	protected get slotTemplate() {
		return html`<slot></slot>`
	}

	@eventListener('click')
	protected handleClick() {
		this.openExplorer()
	}

	@eventListener('dragover')
	protected handleDragOver(e: DragEvent) {
		e.preventDefault()
		this.toggleAttribute('drag', true)
	}

	@eventListener('dragleave')
	protected handleDragLeave(e: DragEvent) {
		e.preventDefault()
		this.toggleAttribute('drag', false)
	}

	@eventListener('drop')
	protected async handleDrop(e: DragEvent) {
		// Prevent file from being opened in the browser as it is the default behavior
		e.preventDefault()

		this.toggleAttribute('drag', false)

		const files = Array.from(e.dataTransfer?.items ?? [])
			.filter(item => item.kind === 'file')
			.map(item => item.getAsFile())
			.filter(file => !!file) as Array<File>

		const selection = this.multiple ? files : files[0]
		await this.uploadSelection(selection as FileUploadSelection<TMultiple>)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-file-upload-drop-area': FileUploadDropArea<unknown>
	}
}