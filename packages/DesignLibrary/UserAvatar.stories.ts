import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import './index.js'

type Args = {
	readonly name?: string
	readonly email?: string
}

export default {
	title: 'Data / User Avatar',
	tags: ['status:preview'],
	component: 'mo-user-avatar',
	args: {
		name: 'Clarke Griffin',
		email: 'clarke.griffin@example.com',
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ name, email }) => html`
		<mo-user-avatar name=${name ?? ''} email=${email ?? ''}>
			<mo-navigation-menu-item icon='dashboard'>Dashboard</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Settings</mo-navigation-menu-item>
		</mo-user-avatar>
	`,
}

/** Without `email`, the menu shows only the name above its items. */
export const WithoutEmail: Story = {
	render: () => html`
		<mo-user-avatar name='Clarke Griffin'>
			<mo-navigation-menu-item icon='dashboard'>Dashboard</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Settings</mo-navigation-menu-item>
		</mo-user-avatar>
	`,
}

/** Without a `name` nobody is signed in: the avatar shows an account button, which opens the application's sign-in if it has one. */
export const Unauthenticated: Story = {
	render: () => html`
		<mo-user-avatar>
			<mo-navigation-menu-item icon='dashboard'>Dashboard</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Settings</mo-navigation-menu-item>
		</mo-user-avatar>
	`,
}
