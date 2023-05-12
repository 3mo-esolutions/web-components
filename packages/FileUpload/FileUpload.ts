import { Component, component, event, html, property, query, state } from '@a11d/lit'
import { NotificationHost } from '@a11d/lit-application'
import '@3mo/localization'

/**
 * @element mo-file-upload - Facilitates the upload of files.
 *
 * @attr upload - The mandatory upload function that is called when the user selects a file.
 * @attr uploadOnSelection
 *
 * @i18n "Upload has failed. Try again."
 *
 * @fires change {CustomEvent<TResult | undefined>} - Fired when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed.
 * @fires uploadingChange {CustomEvent<boolean>} - Fired when the uploading process starts or ends. The event detail is true if the uploading process has started, false otherwise.
 * @fires fileChange {CustomEvent<File | undefined>} - Fired when the selected file changes. The event detail is the selected file or undefined if no file is selected.
 */
@component('mo-file-upload')
export class FileUpload<TResult> extends Component {
	@event() readonly change!: EventDispatcher<TResult | undefined>
	@event() readonly uploadingChange!: EventDispatcher<boolean>
	@event() readonly fileChange!: EventDispatcher<File | undefined>

	@property({ type: Function }) upload!: (file: File) => Promise<TResult>
	@property({ type: Boolean }) uploadOnSelection = false

	@state() protected isUploading = false

	@query('input') protected readonly inputElement!: HTMLInputElement

	openExplorer() {
		this.inputElement.click()
	}

	get file() { return this.inputElement.files?.[0] }

	async executeUpload(action?: () => Promise<TResult>) {
		try {
			this.setIsUploading(true)
			action ??= this.uploadFile
			const result = await action()
			this.change.dispatch(result)
			return result
		} catch (error) {
			NotificationHost.instance?.notifyError(t('Upload has failed. Try again.'))
			this.change.dispatch(undefined)
			throw error
		} finally {
			this.setIsUploading(false)
			this.resetFiles()
		}
	}

	uploadFile(file?: File) {
		file ??= this.file
		if (!file) {
			throw new Error('No file selected')
		}
		return this.upload(file)
	}

	protected setIsUploading(isUploading: boolean) {
		this.isUploading = isUploading
		this.uploadingChange.dispatch(isUploading)
	}

	protected resetFiles() {
		this.inputElement.files = null
		this.fileChange.dispatch(undefined)
	}

	protected override get template() {
		return html`
			<input type='file' style='display: none' @change=${this.handleChange}>
		`
	}

	private handleChange = () => {
		const file = this.file
		this.fileChange.dispatch(file)
		return !this.uploadOnSelection ? undefined : this.executeUpload()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-file-upload': FileUpload<unknown>
	}
}