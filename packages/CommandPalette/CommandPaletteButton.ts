import { Component, component, css, html } from '@a11d/lit'
import { dependsOnScreenSize } from '@3mo/screen-size'
import { CommandPalette } from './CommandPalette.js'

@component('mo-command-palette-button')
export class CommandPaletteButton extends Component {
	static override get styles() {
		return css`
			mo-button {
				color: var(--mo-color-on-accent);
				--mo-button-accent-color: var(--mo-color-on-accent);
				--mo-button-horizontal-padding: 8px;
				background: rgba(0, 0, 0, 0.1);
				border: 1px solid rgba(0, 0, 0, 0.5);
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
							<mo-keyboard-key key='Meta P' splitter='+' style='--mo-keyboard-key-background: rgba(0,0,0,0.1); --mo-keyboard-key-border-color: rgba(0,0,0,0.5)'></mo-keyboard-key>
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