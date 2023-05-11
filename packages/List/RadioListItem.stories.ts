import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import './index.js'

export default meta({
	title: 'Radio List Item',
	component: 'mo-radio-list-item',
})

export const Radio = story({
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
})