import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { ButtonType } from '@3mo/button'
import './index.js'

type Args = {
	readonly type: ButtonType
	readonly disabled: boolean
}

export default {
	title: 'Actions / Split Button',
	component: 'mo-split-button',
	args: {
		type: ButtonType.Filled,
		disabled: false,
	},
	argTypes: {
		type: { control: 'select', options: [ButtonType.Text, ButtonType.Outlined, ButtonType.Tonal, ButtonType.Filled] },
	},
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 24px'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ type, disabled }) => html`
		<mo-split-button type=${type} ?disabled=${disabled}>
			<mo-button startIcon='merge'>Merge</mo-button>
			<mo-menu-item slot='more'>Squash and merge</mo-menu-item>
			<mo-menu-item slot='more'>Rebase and merge</mo-menu-item>
		</mo-split-button>
	`,
}

/** The `type` is given to the main button and the arrow alike. Every type but `elevated` is supported. */
export const Types: Story = {
	render: ({ disabled }) => html`
		<mo-split-button type='text' ?disabled=${disabled}>
			<mo-button>Text</mo-button>
			<mo-menu-item slot='more'>Further action</mo-menu-item>
		</mo-split-button>
		<mo-split-button type='outlined' ?disabled=${disabled}>
			<mo-button>Outlined</mo-button>
			<mo-menu-item slot='more'>Further action</mo-menu-item>
		</mo-split-button>
		<mo-split-button type='tonal' ?disabled=${disabled}>
			<mo-button>Tonal</mo-button>
			<mo-menu-item slot='more'>Further action</mo-menu-item>
		</mo-split-button>
		<mo-split-button type='filled' ?disabled=${disabled}>
			<mo-button>Filled</mo-button>
			<mo-menu-item slot='more'>Further action</mo-menu-item>
		</mo-split-button>
	`,
}

/** `disabled` disables the arrow; disable the main button on its own to fade it too. */
export const Disabled: Story = {
	render: ({ type }) => html`
		<mo-split-button type=${type} disabled>
			<mo-button startIcon='merge'>Merge</mo-button>
			<mo-menu-item slot='more'>Squash and merge</mo-menu-item>
		</mo-split-button>
		<mo-split-button type=${type} disabled>
			<mo-button startIcon='merge' disabled>Merge</mo-button>
			<mo-menu-item slot='more'>Squash and merge</mo-menu-item>
		</mo-split-button>
	`,
}

/** The menu takes any menu items, icons and separators included. */
export const MenuItems: Story = {
	render: ({ type, disabled }) => html`
		<mo-split-button type=${type} ?disabled=${disabled}>
			<mo-button startIcon='save'>Save</mo-button>
			<mo-menu-item slot='more' icon='save_as'>Save as</mo-menu-item>
			<mo-menu-item slot='more' icon='file_copy'>Save a copy</mo-menu-item>
			<mo-line slot='more'></mo-line>
			<mo-menu-item slot='more' icon='picture_as_pdf'>Export as PDF</mo-menu-item>
		</mo-split-button>
	`,
}

/** Any subclass of `mo-button` can be the main button, such as a `mo-loading-button` waiting on its click handler. */
export const ButtonSubclasses: Story = {
	render: ({ type, disabled }) => html`
		<mo-split-button type=${type} ?disabled=${disabled}>
			<mo-loading-button startIcon='add' @click=${() => new Promise(resolve => setTimeout(resolve, 2000))}>Create</mo-loading-button>
			<mo-menu-item slot='more' icon='upload'>Import</mo-menu-item>
		</mo-split-button>
	`,
}