import { Component, component, event, html, ifDefined, property, query, state } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import '@3mo/localization'

/** The selected file when "multiple" is not set, or an array of files when it is. */
export type FileUploadSelection<TMultiple extends boolean = false> = TMultiple extends true ? Array<File> : File | undefined

/**
 * @element mo-file-upload - Facilitates the upload of files.
 *
 * @attr upload - The mandatory upload function that is called when the user selects one or more files.
 * @attr uploadOnSelection
 * @attr multiple - Whether multiple files can be selected at once.
 * @attr accept - The file types that are accepted for upload, specified as a string containing a comma-separated list of MIME types or file extensions.
 *
 * @i18n "Upload has failed. Try again."
 *
 * @fires change - Dispatched when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed.
 * @fires uploadingChange - Dispatched when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise.
 * @fires selectionChange - Dispatched when the selection changes. The event detail is the selected file (or array of files when "multiple" is set) or undefined if no file is selected.
 */
@component('mo-file-upload')
export class FileUpload<TResult, TMultiple extends boolean = false> extends Component {
	@event() readonly change!: EventDispatcher<TResult | undefined>
	@event() readonly uploadingChange!: EventDispatcher<boolean>
	@event() readonly selectionChange!: EventDispatcher<FileUploadSelection<TMultiple>>

	@property({ type: Object }) upload!: (selection: FileUploadSelection<TMultiple>) => Promise<TResult>
	@property({ type: Boolean }) uploadOnSelection = false
	@property({ type: Boolean }) multiple?: TMultiple | boolean
	@property({ type: String }) accept?: string

	@state() protected isUploading = false

	@query('input') protected readonly inputElement!: HTMLInputElement

	openExplorer() {
		this.inputElement.click()
	}

	get selection() {
		const files = [...this.inputElement.files ?? []]
		return (this.multiple ? files : files[0]) as FileUploadSelection<TMultiple>
	}

	async executeUpload(action: () => Promise<TResult>) {
		try {
			this.setIsUploading(true)
			const result = await action()
			this.change.dispatch(result)
			return result
		} catch (error) {
			NotificationComponent.notifyError(t('Upload has failed. Try again.'))
			this.change.dispatch(undefined)
			throw error
		} finally {
			this.setIsUploading(false)
			this.resetFiles()
		}
	}

	uploadSelection(override?: FileUploadSelection<TMultiple>) {
		if (Array.isArray(override) ? !override.length : !override) {
			throw new Error('No file selected')
		}
		return this.executeUpload(() => this.upload(override ?? this.selection))
	}

	protected setIsUploading(isUploading: boolean) {
		this.isUploading = isUploading
		this.uploadingChange.dispatch(isUploading)
	}

	protected resetFiles() {
		this.inputElement.files = null
		this.selectionChange.dispatch(this.selection)
	}

	protected override get template() {
		return html`
			<input type='file' style='display: none'
				?multiple=${this.multiple}
				accept=${ifDefined(this.accept)}
				@change=${this.handleChange}
			>
		`
	}

	private handleChange = () => {
		this.selectionChange.dispatch(this.selection)
		return !this.uploadOnSelection ? undefined : this.uploadSelection()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-file-upload': FileUpload<unknown>
	}
}