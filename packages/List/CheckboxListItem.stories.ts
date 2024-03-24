import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import './index.js'

export default {
	title: 'Checkbox List Item',
	component: 'mo-checkbox-list-item',
}

export const Checkbox: StoryObj = {
	render: () => html`
		<mo-card heading='Connectivity' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-checkbox-list-item>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					WiFi
				</mo-checkbox-list-item>

				<mo-checkbox-list-item>
					<mo-icon style='opacity: 0.66' icon='bluetooth'></mo-icon>
					Bluetooth
				</mo-checkbox-list-item>

				<mo-checkbox-list-item>
					<mo-icon style='opacity: 0.66' icon='nfc'></mo-icon>
					NFC
				</mo-checkbox-list-item>
			</mo-list>
		</mo-card>
	`
}