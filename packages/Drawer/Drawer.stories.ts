import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { Drawer } from './index.js'

export default meta({
	title: 'Core/Drawer',
	component: 'mo-drawer',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

function handleClick(this: HTMLElement) {
	const drawer = this.previousElementSibling as Drawer
	drawer.open = !drawer.open
}

export const EmptyState = story({
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
})