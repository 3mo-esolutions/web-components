import { html, component, Component, css } from '@a11d/lit'

@component('mo-avatar')
export class Avatar extends Component {
	static override get styles() {
		return css`
			:host {
				height: 40px;
				width: 40px;
				aspect-ratio: 1 / 1;
				display: flex;
				user-select: none;
				justify-content: center;
				align-items: center;
				border-radius: 50%;
				font-size: var(--mo-font-size-l);
				background: var(--mo-color-accent);
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-avatar': Avatar
	}
}