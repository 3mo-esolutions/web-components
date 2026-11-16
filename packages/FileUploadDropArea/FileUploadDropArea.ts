import { html, css, component, Component, property, event } from '@a11d/lit'
import { NotificationComponent } from '@a11d/lit-application'
import { FileDropController, FilePickerController, type FileUploadSelection } from '@3mo/file-upload'
import '@3mo/localization'
import '@3mo/icon'
import '@3mo/circular-progress'
import '@3mo/focus-ring'
import '@3mo/theme'

/**
 * An area that uploads the files dropped on it, or chosen in the file dialog it opens when clicked.
 *
 * It carries a `dragover` attribute while files are dragged over it, and a `loading` attribute while the upload is pending.
 *
 * @element mo-file-upload-drop-area
 *
 * @slot - The content of the area, in place of the icon and the hint.
 *
 * @attr upload - The mandatory upload function that is called when the user selects one or more files.
 * @attr multiple - Whether multiple files can be selected at once.
 * @attr accept - The file types that are accepted for upload, specified as a string containing a comma-separated list of MIME types or file extensions. Dropped files are filtered by it, too.
 *
 * @csspart button - The button filling the area.
 *
 * @i18n "Drop a file here or click to choose one"
 * @i18n "Drop files here or click to choose them"
 * @i18n "Uploading…"
 * @i18n "Upload has failed. Try again."
 *
 * @fires change - Dispatched when the uploading process results in success or failure. The event detail is the result of the upload, either the result of the upload function or undefined if the upload failed.
 *
 * @accessibility
 * The area is a button named by its content: `Enter` and `Space` open the file dialog, and dropping files is a pointer shortcut for the same choice. The button is disabled while the upload is pending.
 */
@component('mo-file-upload-drop-area')
export class FileUploadDropArea<TResult, TMultiple extends boolean = false> extends Component {
	@event() readonly change!: EventDispatcher<TResult | undefined>

	@property({ type: Object }) upload!: (selection: FileUploadSelection<TMultiple>) => Promise<TResult>
	@property({ type: Boolean }) multiple?: TMultiple | boolean
	@property() accept?: string

	@property({ type: Boolean, reflect: true }) protected loading = false

	protected readonly fileDrop = new FileDropController<TMultiple>(this, () => ({
		multiple: this.multiple as TMultiple,
		accept: this.accept,
		handleDrop: selection => this.uploadSelection(selection),
	}))

	protected readonly filePicker = new FilePickerController<TMultiple>(this, () => ({
		multiple: this.multiple as TMultiple,
		accept: this.accept,
		handlePick: selection => this.uploadSelection(selection),
	}))

	protected async uploadSelection(selection: NonNullable<FileUploadSelection<TMultiple>>) {
		this.loading = true
		try {
			this.change.dispatch(await this.upload(selection))
		} catch (error) {
			NotificationComponent.notifyError(t('Upload has failed. Try again.'))
			this.change.dispatch(undefined)
			throw error
		} finally {
			this.loading = false
		}
	}

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				box-sizing: border-box;
				border: 2px var(--mo-color-transparent-gray-3) dashed;
				padding: 20px;
				transition: var(--mo-duration-quick);
				cursor: pointer;
			}

			:host([dragover]) {
				border-color: var(--mo-color-accent);
				background: var(--mo-color-accent-transparent);
			}

			:host([loading]) {
				pointer-events: none;
			}

			/* Not positioned, so that the focus ring inside it surrounds the whole area. */
			button {
				display: block;
				inline-size: 100%;
				padding: 0;
				border: none;
				background: none;
				color: inherit;
				font: inherit;
				text-align: inherit;
				cursor: inherit;
				outline: none;
			}

			#hint {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.5rem;
				color: var(--mo-color-gray);
				text-align: center;

				mo-icon {
					font-size: 2.5rem;
				}

				mo-circular-progress {
					inline-size: 2.5rem;
					block-size: 2.5rem;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<button type='button' part='button' ?disabled=${this.loading}>
				<mo-focus-ring inward></mo-focus-ring>
				<slot>
					<span id='hint'>
						${this.loading ? html`<mo-circular-progress></mo-circular-progress>` : html`<mo-icon icon='cloud_upload'></mo-icon>`}
						${this.loading ? t('Uploading…') : this.multiple ? t('Drop files here or click to choose them') : t('Drop a file here or click to choose one')}
					</span>
				</slot>
			</button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-file-upload-drop-area': FileUploadDropArea<unknown>
	}
}
