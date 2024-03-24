import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Collapsible List Item',
	component: 'mo-collapsible-list-item',
}

export const Collapsible: StoryObj = {
	render: () => html`
		<mo-card heading='Navigation Menu' style='--mo-card-body-padding: 0px'>
			<mo-list-item>
				<mo-icon style='opacity: 0.66' icon='home'></mo-icon>
				Home
			</mo-list-item>

			<mo-collapsible-list-item>
				<mo-icon style='opacity: 0.66' icon='inventory_2'></mo-icon>
				Sales
				<mo-collapsible-list-item slot='details'>
					Inventory
					<mo-list-item slot='details'>Inbound</mo-list-item>
					<mo-list-item slot='details'>Outbound</mo-list-item>
				</mo-collapsible-list-item>
				<mo-list-item slot='details'>Products</mo-list-item>
				<mo-list-item slot='details'>Categories</mo-list-item>
				<mo-list-item slot='details'>Brands</mo-list-item>
			</mo-collapsible-list-item>
		</mo-card>
	`
}