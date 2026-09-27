import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import './index.js'

export default {
	title: 'Layout / Drawer',
	component: 'mo-drawer',
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-icon-button icon='menu' @click=${() => setOpen(true)}></mo-icon-button>
			<mo-drawer label='Navigation' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-list style='padding-block: 8px'>
					<mo-list-item icon='dashboard'>Dashboard</mo-list-item>
					<mo-list-item icon='receipt_long'>Orders</mo-list-item>
					<mo-list-item icon='group'>Customers</mo-list-item>
					<mo-list-item icon='settings'>Settings</mo-list-item>
				</mo-list>
			</mo-drawer>
		`
	},
}

/** `placement='inline-end'` brings the drawer in from the other side, which follows the writing direction. */
export const Placement: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-icon-button icon='account_circle' @click=${() => setOpen(true)}></mo-icon-button>
			<mo-drawer label='Account' placement='inline-end' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-list style='padding-block: 8px'>
					<mo-list-item icon='person'>Profile</mo-list-item>
					<mo-list-item icon='notifications'>Notifications</mo-list-item>
					<mo-list-item icon='logout'>Sign out</mo-list-item>
				</mo-list>
			</mo-drawer>
		`
	},
}

/** `--mo-drawer-width` sets the width, 256px by default. */
export const CustomProperties: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-icon-button icon='menu' @click=${() => setOpen(true)}></mo-icon-button>
			<mo-drawer label='Navigation' style='--mo-drawer-width: 360px' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-list style='padding-block: 8px'>
					<mo-list-item icon='dashboard'>Dashboard</mo-list-item>
					<mo-list-item icon='receipt_long'>Orders</mo-list-item>
					<mo-list-item icon='settings'>Settings</mo-list-item>
				</mo-list>
			</mo-drawer>
		`
	},
}