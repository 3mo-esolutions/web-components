import { html, eventListener, css, component, query, Component, property, event, literal, staticHtml } from '@a11d/lit'
import { FileUpload } from '@3mo/file-upload'
import '@3mo/file-upload'

/**
 * @element mo-file-upload-drop-area UploadDropArea is a component that allows the user to upload a file by dragging it into the component.
 *
 * @attr upload - The mandatory upload function that is called when the user selects a file.
 *
 * @fires change {CustomEvent<TResult | undefined>} - Fired when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed.
 * @fires uploadingChange {CustomEvent<boolean>} - Fired when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise.
 * @fires fileChange {CustomEvent<File | undefined>} - Fired when the selected file changes. The event detail is the selected file or undefined if no file is selected.
 */
@component('mo-file-upload-drop-area')
export class FileUploadDropArea<TResult> extends Component {
	@event() readonly change!: EventDispatcher<TResult | undefined>
	@event() readonly uploadingChange!: EventDispatcher<boolean>
	@event() readonly fileChange!: EventDispatcher<File | undefined>

	@property({ type: Function }) upload!: (file: File) => Promise<TResult>

	@query('mo-file-upload') protected readonly uploadElement!: FileUpload<TResult>

	protected readonly fileUploadElementTag = literal`mo-file-upload`

	openExplorer(...parameters: Parameters<FileUpload<TResult>['openExplorer']>) {
		return this.uploadElement.openExplorer(...parameters)
	}

	uploadFile(...parameters: Parameters<FileUpload<TResult>['uploadFile']>) {
		return this.uploadElement.uploadFile(...parameters)
	}

	executeUpload(...parameters: Parameters<FileUpload<TResult>['executeUpload']>) {
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
				@change=${(e: CustomEvent<TResult | undefined>) => this.change.dispatch(e.detail)}
				@uploadingChange=${(e: CustomEvent<boolean>) => this.uploadingChange.dispatch(e.detail)}
				@fileChange=${(e: CustomEvent<File | undefined>) => this.fileChange.dispatch(e.detail)}
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

		const file = Array.from(e.dataTransfer?.items ?? [])
			.filter(item => item.kind === 'file')
			.map(item => item.getAsFile())
			.filter(file => !!file)
			.at(0) as File | undefined

		await this.uploadFile(file)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-file-upload-drop-area': FileUploadDropArea<unknown>
	}
}