import { Component, component, css, html, property, style, until, type PropertyValues } from '@a11d/lit'

export type DataGridImagePreviewSource = string | undefined | PromiseLike<string | undefined>

/**
 * @element mo-data-grid-image-preview
 *
 * @attr value - The value whose image is previewed, resolved to an image source by `getSource`.
 * @attr getSource - Resolves the value to an image source, which is the value itself by default.
 * @attr imageHidden - Whether to show only the slotted content without the image.
 *
 * @slot - Content shown above the image.
 * @slot close - An action to close the preview, shown next to the content.
 */
@component('mo-data-grid-image-preview')
export class DataGridImagePreview extends Component {
	@property({ type: Object }) value?: unknown
	@property({ type: Object }) getSource?: (value: unknown) => DataGridImagePreviewSource
	@property({ type: Boolean }) imageHidden = false

	private source?: Promise<string | undefined>

	protected override willUpdate(changedProperties: PropertyValues<this>) {
		super.willUpdate(changedProperties)
		if (changedProperties.has('value') || changedProperties.has('getSource') || changedProperties.has('imageHidden')) {
			this.source = !this.value || this.imageHidden ? undefined : this.loadSource(this.value)
		}
	}

	private async loadSource(value: unknown) {
		const source = await (this.getSource?.(value) ?? value as string)
		if (!source) {
			return undefined
		}
		const exists = await new Promise<boolean>(resolve => {
			const image = new Image()
			image.addEventListener('error', () => resolve(false))
			image.addEventListener('load', () => resolve(true))
			image.src = source
		})
		return exists ? source : undefined
	}

	static override get styles() {
		return css`
			:host {
				position: relative;
			}

			mo-circular-progress {
				width: 32px;
				height: 32px;
				margin: 0 auto;
			}

			mo-grid {
				box-sizing: border-box;
				max-width: 500px;
				max-height: 500px;
				padding: 16px;
			}

			#content {
				overflow: hidden;
				min-height: 250px;
				min-width: 350px;
			}

			mo-icon {
				color: var(--mo-color-transparent-gray-3);
				font-size: 128px;
			}

			img {
				max-width: 100%;
				max-height: 100%;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-grid justifyContent='center' gap='0.5rem' rows='auto 1fr'>
				<mo-flex direction='horizontal-reversed' gap='0.5rem'>
					<slot name='close'></slot>
					<mo-flex ${style({ flex: 1, justifyContent: 'center' })}>
						<slot></slot>
					</mo-flex>
				</mo-flex>
				${!this.source ? html.nothing : html`
					<mo-flex id='content' alignItems='center' justifyContent='center'>
						${until(
							this.source.then(source => !source
								? html`<mo-icon icon='image_not_supported'></mo-icon>`
								: html`<img src=${source}>`),
							html`<mo-circular-progress></mo-circular-progress>`,
						)}
					</mo-flex>
				`}
			</mo-grid>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-image-preview': DataGridImagePreview
	}
}
