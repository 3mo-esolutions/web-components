import { story, meta } from '../../../.storybook/story.js'
import { html } from '@a11d/lit'
import './index.js'

export default meta({
	title: 'Core/List/Item/Selectable',
	component: 'mo-selectable-list-item',
})

export const Selectable = story({
	render: () => html`
		<mo-card heading='Connectivity' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-selectable-list-item>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					WiFi
				</mo-selectable-list-item>

				<mo-selectable-list-item>
					<mo-icon style='opacity: 0.66' icon='bluetooth'></mo-icon>
					Bluetooth
				</mo-selectable-list-item>

				<mo-selectable-list-item>
					<mo-icon style='opacity: 0.66' icon='nfc'></mo-icon>
					NFC
				</mo-selectable-list-item>
			</mo-list>
		</mo-card>
	`
})