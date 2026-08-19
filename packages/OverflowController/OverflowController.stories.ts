import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, query } from '@a11d/lit'
import p from './package.json'
import { OverflowController } from './OverflowController.js'

export default {
	title: 'Utilities / Overflow Controller',
	package: p,
} as Meta

const actions = ['New', 'Open', 'Save As…', 'Export to PDF', 'Share', 'Duplicate', 'Rename', 'Move to Folder', 'Print', 'Delete']

class StoryOverflow extends Component {
	/** The room set aside for the "+n" badge as soon as at least one item overflows. */
	private static readonly badgeSize = 64

	@property({ type: Array }) pinned = new Array<string>()

	@query('#container') private readonly container!: HTMLElement

	protected readonly overflowController = new OverflowController(this, host => ({
		get container() { return host.container },
		get items() { return [...host.renderRoot?.querySelectorAll('.item') ?? []] },
		reservedSize: StoryOverflow.badgeSize,
		isPinned: item => item.hasAttribute('data-pinned'),
		handleChange: (item, overflows) => item.toggleAttribute('data-overflows', overflows),
	}))

	static override get styles() {
		return css`
			#container {
				display: flex;
				align-items: center;
				gap: 8px;
				width: min(640px, 100%);
				min-width: 120px;
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
					background: var(--mo-color-accent-transparent);
					color: var(--mo-color-accent);
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

			#hint {
				padding: 8px;
				color: var(--mo-color-gray);
				font-size: small;
			}
		`
	}

	protected override get template() {
		const { overflowingItems, hasOverflow } = this.overflowController
		return html`
			<div id='container'>
				${actions.map(action => html`
					<span class='item' ?data-pinned=${this.pinned.includes(action)}>${action}</span>
				`)}
				${!hasOverflow ? html.nothing : html`<span id='badge'>+${overflowingItems.size}</span>`}
			</div>
			<div id='hint'>
				${!hasOverflow
					? 'Everything fits. Drag the handle at the container\'s end corner to shrink it.'
					: `Overflowing: ${[...overflowingItems].map(item => item.textContent).join(', ')}`}
			</div>
		`
	}
}

customElements.define('story-overflow', StoryOverflow)

export const Overflow: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'The controller only decides *what* overflows - what to do with the verdict is up to the host: this one hides overflowing items via an attribute and renders a "+n" badge, whose room is set aside through the `reservedSize` option as soon as anything overflows. Drag the resize handle at the end of the container to see items overflow from the end and return - each item is touched only when its own verdict changes.'
			}
		}
	},
	render: () => html`<story-overflow></story-overflow>`
}

export const PinnedItems: StoryObj = {
	parameters: {
		docs: {
			description: {
				story: 'Items for which the `pinned` option returns `true` never overflow: they keep their place while the flexible items around them come and go. Here, "Save As…" and "Delete" are pinned.'
			}
		}
	},
	render: () => html`<story-overflow .pinned=${['Save As…', 'Delete']}></story-overflow>`
}