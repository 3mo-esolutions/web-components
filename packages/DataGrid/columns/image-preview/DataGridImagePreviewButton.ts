import { bind, Component, component, css, html, property, queryConnectedInstances, state } from '@a11d/lit'
import type { DataGridImagePreviewSource } from './DataGridImagePreview.js'

/**
 * @element mo-data-grid-image-preview-button
 *
 * @attr value - The value whose image is previewed.
 * @attr getSource - Resolves the value to an image source.
 *
 * @slot - Content shown above the image in the preview.
 */
@component('mo-data-grid-image-preview-button')
export class DataGridImagePreviewButton extends Component {
	@queryConnectedInstances() static readonly instances: Set<DataGridImagePreviewButton>

	@property({ type: Object }) value?: unknown
	@property({ type: Object }) getSource?: (value: unknown) => DataGridImagePreviewSource

	@state() open = false

	/** Opens the preview and closes the previews of all other buttons. */
	show() {
		for (const instance of DataGridImagePreviewButton.instances) {
			instance.open = instance === this
		}
	}

	static override get styles() {
		return css`
			mo-icon-button {
				color: var(--mo-color-gray);
				&[data-open] {
					color: var(--mo-color-accent);
				}
			}

			mo-popover {
				overflow: hidden;
				background: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-foreground) 6%);

				&::part(arrow) {
					display: block;
					width: 1.5rem;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-popover-container title=''>
				<mo-icon-button icon='preview' ?data-open=${this.open}></mo-icon-button>
				<mo-popover slot='popover' alignment='center' ?open=${bind(this, 'open')}>
					<mo-data-grid-image-preview .value=${this.value} .getSource=${this.getSource} ?imageHidden=${!this.open}>
						<mo-icon-button dense icon='close' slot='close' @click=${() => this.open = false}></mo-icon-button>
						<slot></slot>
					</mo-data-grid-image-preview>
				</mo-popover>
			</mo-popover-container>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-data-grid-image-preview-button': DataGridImagePreviewButton
	}
}
