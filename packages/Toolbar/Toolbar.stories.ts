import { type Meta, type StoryObj } from '@storybook/web-components-vite'
import { Component, html, property, range, style } from '@a11d/lit'
import { type MaterialIcon } from '@3mo/icon'
import { ToolbarController } from './index.js'
import p from './package.json'

export default {
	title: 'Layout & Containment / Toolbar',
	component: 'mo-toolbar',
	package: p,
} as Meta

const resizable = (content: unknown) => html`
	<div ${style({ resize: 'horizontal', overflow: 'hidden', minWidth: '100px', padding: '4px', border: '1px dashed var(--mo-color-transparent-gray-3)', borderRadius: 'var(--mo-border-radius)' })}>
		${content}
	</div>
`

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
	parameters: {
		docs: {
			description: {
				story: 'Items which no longer fit move into the overflow menu - drag the handle at the dashed container\'s end corner to resize the toolbar. As the very same elements are only reassigned between slots, they keep their state and event listeners in either home. The "Paste" item opts out of overflowing via the `data-no-overflow` attribute and always stays in the toolbar.'
			}
		}
	},
	render: ({ collapsed, extraItems, overflowIcon, overflowPosition }) => resizable(html`
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
	`)
}

export const WithController: StoryObj = {
	args: { itemCount: 4 },
	parameters: {
		docs: {
			description: {
				story: 'The `ToolbarController` orchestrates any pane/overflow-slot pair on a custom component. This one hosts two independent panes - the right one laid out right-to-left - whose overflowing items gather in a shared list toggled by the button in between.'
			}
		}
	},
	render: ({ itemCount }) => {
		return resizable(html`
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
		`)
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