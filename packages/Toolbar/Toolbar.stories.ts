import { type Meta, type StoryObj } from '@storybook/web-components'
import { Component, html, property, range } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { ToolbarController } from './index.js'
import p from './package.json'

export default {
	title: 'Utilities / Toolbar',
	component: 'mo-toolbar',
	package: p,
} as Meta

export const Default: StoryObj = {
	args: {
		collapsed: false,
		extraItems: 5,
		overflowIcon: 'more_vert' as MaterialIcon,
		overflowPosition: 'end' as ('end' | 'start'),
	},
	argTypes: {
		collapsed: {
			control: 'boolean'
		},
		extraItems: {
			control: 'number'
		},
		overflowPosition: {
			control: 'radio',
			options: ['start', 'end']
		}
	},
	render: ({ collapsed, extraItems, overflowIcon, overflowPosition }) => html`
		<mo-toolbar ?collapsed=${collapsed} overflowIcon=${overflowIcon} overflowPosition=${overflowPosition}>
			<mo-menu-item icon='content_cut'>
				<span>Cut</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_paste' data-no-overflow>
				<span>Paste</span>
			</mo-menu-item>
			${[...range(0, extraItems)].map(i => html`
				<mo-menu-item icon='category'>
					<span>Item ${i + 1}</span>
				</mo-menu-item>
			`)}
		</mo-toolbar>
	`
}

export const WithController: StoryObj = {
	args: { itemCount: 4 },
	render: ({ itemCount }) => {
		return html`
			<story-custom-toolbar>
				${[...range(0, itemCount)].map(i => html`
					<mo-menu-item icon='arrow_circle_left' slot='left'>
						<span>Left ${i + 1}</span>
					</mo-menu-item>
				`)}
				${[...range(0, itemCount)].map(i => html`
					<mo-menu-item icon='arrow_circle_right' slot='right'>
						<span>Right ${i + 1}</span>
					</mo-menu-item>
				`)}
			</story-custom-toolbar>
		`
	}
}
class StoryCustomToolbar extends Component {
	@property({ type: Boolean, reflect: true }) open = false

	protected readonly leftToolbarController = new ToolbarController(this, {
		paneSlotName: 'left',
		overflowContentSlotName: 'left-ovf',
	})

	protected readonly rightToolbarController = new ToolbarController(this, {
		paneSlotName: 'right',
		overflowContentSlotName: 'right-ovf',
	})

	protected override get template() {
		return html`
			<div style='display: flex; width: 100%; gap: 5px'>
				<mo-toolbar-pane ${this.leftToolbarController.pane()} style='flex: 1 1;'>
					<slot name=${this.leftToolbarController.paneSlotName}></slot>
				</mo-toolbar-pane>
				<mo-button style='flex: 0 0 auto' @click=${() => this.open = !this.open}>Overflow</mo-button>
				<mo-toolbar-pane ${this.rightToolbarController.pane()} style='flex: 1 1; direction: rtl'>
					<slot name=${this.rightToolbarController.paneSlotName}></slot>
				</mo-toolbar-pane>
			</div>
			<mo-list style='max-width: 350px; border-radius: var(--mo-border-radius); margin-inline: auto; margin-block: 10px; background-color: var(--mo-color-accent); display: ${this.open ? 'block' : 'none'}'>
				<slot name=${this.leftToolbarController.overflowContentSlotName}></slot>
				<slot name=${this.rightToolbarController.overflowContentSlotName}></slot>
			</mo-list>
		`
	}
}

customElements.define('story-custom-toolbar', StoryCustomToolbar)