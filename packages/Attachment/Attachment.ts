import { Component, component, css, event, html, ifDefined, property, state } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import { type MaterialIcon } from '@3mo/icon'
import '@3mo/localization'
import '@3mo/theme'
import '@3mo/focus-ring'
import '@material/web/ripple/ripple.js'

const iconsByExtension = new Map(Object.entries({
	image: 'jpg jpeg png gif webp svg avif bmp heic',
	picture_as_pdf: 'pdf',
	movie: 'mp4 mov webm avi mkv',
	audio_file: 'mp3 wav ogg m4a flac',
	folder_zip: 'zip rar 7z tar gz',
	table_chart: 'csv xls xlsx ods',
	code: 'xml json html',
	description: 'doc docx odt rtf txt md',
} satisfies Partial<Record<MaterialIcon, string>>).flatMap(([icon, extensions]) => extensions.split(' ').map(extension => [extension, icon as MaterialIcon] as const)))

const sizeUnits = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const

/**
 * A file shown by its name, its type and size, a thumbnail and the actions on it.
 *
 * @element mo-attachment
 *
 * @attr name - The file name. Its extension selects the icon and the type shown under the name.
 * @attr size - The file size in bytes, shown under the name in the unit that fits it.
 * @attr thumbnail - The URL of a preview image shown in place of the icon. The icon returns if the image cannot be loaded.
 * @attr href - Renders the name as a link to the file, which a press anywhere on the attachment follows.
 * @attr target - The link target, with `href`.
 * @attr removable - Renders the remove button.
 *
 * @slot - The line under the name, in place of the type and size.
 * @slot media - A graphic in place of the icon or thumbnail.
 * @slot action - Controls at the end, before the remove button.
 *
 * @csspart media - The box of the icon or thumbnail.
 * @csspart name - The file name.
 * @csspart description - The line under the name.
 * @csspart remove - The remove button.
 *
 * @i18n "Remove ${label:string}"
 *
 * @fires requestRemove - Dispatched when the remove button is pressed. Cancelable. The attachment never removes itself.
 *
 * @accessibility
 * With `href` the name is a link, and a press anywhere on the attachment but on its controls follows it. To open a preview of your own, prevent the default of that `click`. The remove button is named "Remove" and the file name. The icon and the thumbnail are decoration and hidden from assistive technology.
 */
@component('mo-attachment')
export class Attachment extends Component {
	@event({ bubbles: true, cancelable: true }) readonly requestRemove!: EventDispatcher

	@property() name = ''
	@property({ type: Number }) size?: number
	@property() thumbnail?: string
	@property() href?: string
	@property() target?: '_blank' | '_parent' | '_self' | '_top'
	@property({ type: Boolean }) removable = false

	@state() private failedThumbnail?: string

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host {
				display: block;
				position: relative;
				padding: 0.5rem 0.625rem;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-1);
				color: var(--mo-color-on-surface);
				font-size: 0.875rem;

				--md-ripple-hover-color: currentColor;
				--md-ripple-pressed-color: currentColor;
			}

			#root {
				display: grid;
				grid-template-columns: auto minmax(0, 1fr) auto;
				align-items: center;
				column-gap: 0.75rem;
			}

			#media {
				display: grid;
				place-items: center;
				inline-size: 2.5rem;
				block-size: 2.5rem;
				overflow: clip;
				border-radius: var(--mo-border-radius);
				background: var(--mo-color-transparent-gray-2);
				color: var(--mo-color-gray);

				img {
					inline-size: 100%;
					block-size: 100%;
					object-fit: cover;
				}

				mo-icon {
					font-size: 1.5rem;
				}
			}

			#text {
				display: grid;
				line-height: 1.35;
			}

			#name, #description {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			#name {
				font-weight: 500;
				color: inherit;
				text-decoration: none;
				outline: none;
			}

			/* Not positioned, so that its hit area and the focus ring inside it cover the whole attachment. */
			a#name {
				&::after {
					content: '';
					position: absolute;
					inset: 0;
				}

				&:hover {
					text-decoration: underline;
				}
			}

			#description {
				font-size: 0.75rem;
				color: var(--mo-color-gray);
			}

			/* Positioned, so that it lies above the hit area of the link. */
			#actions {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				position: relative;
			}

			#remove {
				display: grid;
				place-items: center;
				position: relative;
				inline-size: 1.75rem;
				block-size: 1.75rem;
				padding: 0;
				border: none;
				border-radius: 50%;
				background: none;
				color: var(--mo-color-gray);
				cursor: pointer;
				outline: none;

				mo-icon {
					font-size: 1.125rem;
				}
			}
		`
	}

	private get extension() {
		const index = this.name.lastIndexOf('.')
		return index <= 0 ? '' : this.name.slice(index + 1).toLowerCase()
	}

	private get sizeText() {
		if (this.size === undefined) {
			return undefined
		}
		const exponent = Math.min(Math.floor(Math.log2(Math.max(this.size, 1)) / 10), sizeUnits.length - 1)
		return (this.size / 1024 ** exponent).formatAsUnit(sizeUnits[exponent]!, {
			maximumFractionDigits: exponent > 1 ? 1 : 0,
			unitDisplay: exponent > 0 ? 'short' : 'long',
		})
	}

	protected override get template() {
		return html`
			<div id='root'>
				<span id='media' part='media' aria-hidden='true'>
					<slot name='media'>${this.mediaTemplate}</slot>
				</span>
				<span id='text'>
					${this.nameTemplate}
					<span id='description' part='description'>
						<slot>${[this.extension.toUpperCase(), this.sizeText].filter(Boolean).join(' · ')}</slot>
					</span>
				</span>
				${!this.removable && !this.slotController.hasAssignedContent('action') ? html.nothing : html`
					<span id='actions'>
						<slot name='action'></slot>
						${this.removeTemplate}
					</span>
				`}
			</div>
		`
	}

	protected get mediaTemplate() {
		return this.thumbnail && this.thumbnail !== this.failedThumbnail ? html`
			<img src=${this.thumbnail} alt='' @error=${() => this.failedThumbnail = this.thumbnail}>
		` : html`
			<mo-icon icon=${iconsByExtension.get(this.extension) ?? 'insert_drive_file'}></mo-icon>
		`
	}

	protected get nameTemplate() {
		return !this.href ? html`
			<span id='name' part='name' title=${this.name}>${this.name}</span>
		` : html`
			<a id='name' part='name' title=${this.name} href=${this.href} target=${ifDefined(this.target)}>
				<mo-focus-ring inward></mo-focus-ring>
				${this.name}
			</a>
		`
	}

	protected get removeTemplate() {
		return !this.removable ? html.nothing : html`
			<button id='remove' part='remove' type='button'
				aria-label=${t('Remove ${label:string}', { label: this.name })}
				@click=${this.handleRemoveClick}
			>
				<md-ripple></md-ripple>
				<mo-focus-ring inward></mo-focus-ring>
				<mo-icon icon='close'></mo-icon>
			</button>
		`
	}

	protected handleRemoveClick(event: Event) {
		// A press on the remove button is not a press on the attachment, for consumers listening on the host.
		event.stopPropagation()
		this.requestRemove.dispatch()
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-attachment': Attachment
	}
}
