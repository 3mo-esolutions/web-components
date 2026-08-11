import { Component, component, css, html } from '@a11d/lit'
import { dependsOnScreenSize } from '@3mo/screen-size'
import { CommandPalette } from './CommandPalette.js'

@component('mo-command-palette-button')
export class CommandPaletteButton extends Component {
	static override get styles() {
		return css`
			/* Tints itself with the color it inherits from its surroundings, so that it keeps its contrast on any background e.g. the navbar's tonal container */
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
		`
	}

	protected override get template() {
		const searchLabelTemplate = html`<span id='label'>${t('Search')}</span>`
		return html`
			<mo-button @click=${() => CommandPalette.open()}>
				<mo-flex direction='horizontal' gap='6px' alignItems='center'>
					<mo-icon icon='search'></mo-icon>
					${dependsOnScreenSize({
						desktop: html`
							${searchLabelTemplate}
							<mo-key>Meta+P</mo-key>
						`,
						tablet: searchLabelTemplate,
						mobile: html.nothing,
					})}
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