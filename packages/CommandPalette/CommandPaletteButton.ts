import { Component, component, css, html } from '@a11d/lit'
import { CommandPalette } from './CommandPalette.js'

/**
 * A search button that opens the command palette and shows its shortcut on wide screens.
 *
 * @element mo-command-palette-button
 */
@component('mo-command-palette-button')
export class CommandPaletteButton extends Component {
	static override get styles() {
		return css`
			mo-button {
				color: inherit;
				--mo-button-accent-color: currentColor;
				--mo-button-horizontal-padding: 8px;
				background: color-mix(in srgb, currentColor 8%, transparent);
				border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
				font-size: small;
				border-radius: 4px;
				gap: 6px;
				height: 32px;
				min-height: 32px;
			}

			mo-icon {
				opacity: 0.75;
				font-size: 18px;
			}

			#label {
				opacity: 0.75;
				font-size: small;
			}

			@media (max-width: 1024px) {
				mo-key {
					display: none;
				}
			}

			@media (max-width: 640px) {
				#label {
					display: none;
				}
			}
		`
	}

	protected override get template() {
		return html`
			<mo-button @click=${() => CommandPalette.open()}>
				<mo-flex direction='horizontal' gap='6px' alignItems='center'>
					<mo-icon icon='search'></mo-icon>
					<span id='label'>${t('Search')}</span>
					<mo-key>Meta+P</mo-key>
				</mo-flex>
			</mo-button>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-command-palette-button': CommandPaletteButton
	}
}
