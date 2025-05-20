import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Drawer',
	component: 'mo-drawer',
	package: p,
} as Meta

function handleClick(this: HTMLElement) {
	const drawer = this.previousElementSibling as HTMLElement & { open: boolean }
	drawer.open = !drawer.open
}

export const Drawer: StoryObj = {
	render: () => html`
		<mo-drawer>
			<mo-flex gap='10px'>
				<span>Item 1</span>
				<span>Item 2</span>
				<span>Item 3</span>
			</mo-flex>
		</mo-drawer>
		<mo-icon-button icon='menu'
			@click=${handleClick}
		></mo-icon-button>
	`
}