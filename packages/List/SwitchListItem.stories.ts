import { story, meta } from '../../../.storybook/story.js'
import { html } from '@a11d/lit'
import './index.js'

export default meta({
	title: 'Core/List/Item/Switch',
	component: 'mo-switch-list-item',
})

export const Switch = story({
	render: () => html`
		<mo-card heading='Connectivity' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-switch-list-item>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					WiFi
				</mo-switch-list-item>

				<mo-switch-list-item>
					<mo-icon style='opacity: 0.66' icon='bluetooth'></mo-icon>
					Bluetooth
				</mo-switch-list-item>

				<mo-switch-list-item>
					<mo-icon style='opacity: 0.66' icon='nfc'></mo-icon>
					NFC
				</mo-switch-list-item>
			</mo-list>
		</mo-card>
	`
})