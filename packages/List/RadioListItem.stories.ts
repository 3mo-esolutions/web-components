import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Radio List Item',
	component: 'mo-radio-list-item',
}

export const Radio: StoryObj = {
	render: () => html`
		<mo-card heading='Notifications' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-radio-list-item>
					<mo-icon style='opacity: 0.66' icon='notifications'></mo-icon>
					All
				</mo-radio-list-item>

				<mo-radio-list-item>
					<mo-icon style='opacity: 0.66' icon='person'></mo-icon>
					Personalized
				</mo-radio-list-item>

				<mo-radio-list-item>
					<mo-icon style='opacity: 0.66' icon='do_not_disturb'></mo-icon>
					None
				</mo-radio-list-item>
			</mo-list>
		</mo-card>
	`
}