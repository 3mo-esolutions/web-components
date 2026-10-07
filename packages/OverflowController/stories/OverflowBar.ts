import { Component, component, css, html, property } from '@a11d/lit'
import { OverflowController } from '@3mo/overflow-controller'

const actions = ['New', 'Open', 'Save As…', 'Export to PDF', 'Share', 'Duplicate', 'Rename', 'Move to Folder', 'Print', 'Delete']

/** A row of actions that hides the ones which do not fit and counts them in a "+n" badge. */
@component('story-overflow-bar')
export class OverflowBar extends Component {
	@property({ type: Array }) pinned = new Array<string>()

	readonly overflowController = new OverflowController(this, {
		// The room of the badge, set aside as soon as anything overflows.
		reservedSize: 64,
		handleChange: (item, overflows) => item.toggleAttribute('data-overflows', overflows),
	})

	static override get styles() {
		return css`
			#container {
				display: flex;
				align-items: center;
				gap: 8px;
				inline-size: min(640px, 100%);
				min-inline-size: 120px;
				padding: 8px;
				overflow: hidden;
				resize: horizontal;
				border: 1px solid var(--mo-color-transparent-gray-3);
				border-radius: var(--mo-border-radius);
			}

			.item {
				flex: 0 0 auto;
				white-space: nowrap;
				padding: 4px 12px;
				border-radius: 100px;
				background: var(--mo-color-transparent-gray-1);

				&[data-pinned] {
					background: var(--mo-color-selected);
					color: var(--mo-color-on-selected);
				}

				&[data-overflows] {
					display: none;
				}
			}

			#badge {
				flex: 0 0 auto;
				margin-inline-start: auto;
				padding: 4px 12px;
				border-radius: 100px;
				background: var(--mo-color-accent);
				color: var(--mo-color-on-accent);
			}
		`
	}

	protected override get template() {
		const { overflowingItems, hasOverflow } = this.overflowController
		return html`
			<div id='container' ${this.overflowController.container()}>
				${actions.map(action => html`
					<span class='item' ?data-pinned=${this.pinned.includes(action)} ${this.overflowController.item({ pinned: this.pinned.includes(action) })}>${action}</span>
				`)}
				${!hasOverflow ? html.nothing : html`
					<span id='badge' title=${[...overflowingItems].map(item => item.textContent).join(', ')}>+${overflowingItems.size}</span>
				`}
			</div>
		`
	}
}
