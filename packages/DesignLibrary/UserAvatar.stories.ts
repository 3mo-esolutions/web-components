import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'UserAvatar',
	component: 'mo-user-avatar',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Avatar = story({
	render: () => html`
		<mo-user-avatar name='John Doe' email='john.doe@email.com'>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
})

export const Unauthenticated = story({
	render: () => html`
		<mo-user-avatar>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
})

export const WithoutEmail = story({
	render: () => html`
		<mo-user-avatar name='john Doe'>
			<mo-navigation-menu-item icon='dashboard'>Item 1</mo-navigation-menu-item>
			<mo-navigation-menu-item icon='settings'>Item 2</mo-navigation-menu-item>
		</mo-user-avatar>
	`
})