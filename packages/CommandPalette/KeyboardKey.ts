import { Component, component, html, property, css, join } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import * as System from 'detect-browser'

@component('mo-keyboard-key')
export class KeyboardKey extends Component {
	private static readonly iconsByKey = new Map<string, MaterialIcon>([
		['Backspace', 'backspace'],
		['Tab', 'keyboard_tab'],
		['ArrowUp', 'arrow_upward'],
		['ArrowDown', 'arrow_downward'],
		['ArrowLeft', 'arrow_forward'],
		['ArrowRight', 'arrow_back'],
	])

	@property() key!: string
	@property() splitter?: string

	static override get styles() {
		return css`
			:host {
				--mo-keyboard-key-background: var(--mo-color-transparent-gray-3);
			}

			kbd {
				display: inline-block;
				font-size: 0.85em;
				display: flex;
				align-items: center;
				justify-content: center;
				white-space: nowrap;
				font-weight: 700;
				padding: 2px 4px;
				background: var(--mo-keyboard-key-background);
				border: 1px solid var(--mo-keyboard-key-border-color, var(--mo-keyboard-key-background));
				border-radius: var(--mo-border-radius);

				mo-icon {
					font-size: inherit;
				}
			}
		`
	}

	private get keys() {
		return this.key.split(/[\s+]/).map(key => key.trim()).filter(Boolean)
	}

	protected override get template() {
		return html`
			<mo-flex alignItems='center' direction='horizontal' gap='2px'>
				${join(this.keys.map(key => html`<kbd>${this.getKeyTemplate(key)}</kbd>`), !this.splitter ? html.nothing : html`<span>${this.splitter}</span>`)}
			</mo-flex>
		`
	}

	private getKeyTemplate(key: string) {
		switch (true) {
			case key === 'Escape':
				return 'ESC'
			case key === 'Meta':
				return System.detect()?.os === 'Mac OS' ? '⌘' : 'Ctrl'
			case KeyboardKey.iconsByKey.has(key):
				return html`<mo-icon icon=${KeyboardKey.iconsByKey.get(key)!}></mo-icon>`
			default:
				return key
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-keyboard-key': KeyboardKey
	}
}