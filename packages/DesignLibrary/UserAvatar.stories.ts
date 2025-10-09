import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Unreleased / User Avatar',
	component: 'mo-user-avatar',
	package: p,
} as Meta

export const Avatar: StoryObj = {
	render: () => html`
		<mo-user-avatar name='John Doe' email='john.doe@email.com'>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
}

export const Unauthenticated: StoryObj = {
	render: () => html`
		<mo-user-avatar>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
}

export const WithoutEmail: StoryObj = {
	render: () => html`
		<mo-user-avatar name='john Doe'>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
}