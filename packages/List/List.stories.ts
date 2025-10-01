import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
// eslint-disable-next-line no-duplicate-imports
import { SelectableListSelectability } from './index.js'

export default {
	title: 'Data Display / List',
	component: 'mo-list',
	package: p,
} as Meta

const keyboardShortcut = (shortcut: string) => html`
	<span slot='end' style='font-size: 13px; color: darkgray'>${shortcut}</span>
`

const separator = html`
	<div role='separator' style='width: 100%; height: 1px; background: darkgray; opacity: 0.3'></div>
`

const items = html`
	<mo-list-item>
		<mo-icon slot='start' style='opacity: 0.66' icon='inbox'></mo-icon>
		Inbox
		${keyboardShortcut('Ctrl + I')}
	</mo-list-item>
	<mo-list-item>
		<mo-icon slot='start' style='opacity: 0.66' icon='drafts'></mo-icon>
		Drafts
		${keyboardShortcut('Ctrl + D')}
	</mo-list-item>
	${separator}
	<mo-list-item><span class='first-column-padding' hidden></span>Trash</mo-list-item>
	<mo-list-item><span class='first-column-padding' hidden></span>Spam</mo-list-item>
	${separator}
	<mo-list-item disabled style='opacity: 1'>
		<mo-icon slot='start' style='opacity: 0.33' icon='settings_suggest'></mo-icon>
		<span>
			<span style='opacity: 0.5'>Personalization -</span>
			<mo-anchor style='pointer-events: auto;'>Upgrade to Pro!</mo-anchor>
		</span>
	</mo-list-item>
	<mo-list-item>
		<mo-icon slot='start' style='opacity: 0.66' icon='logout'></mo-icon>
		Logout
	</mo-list-item>
`

export const Default: StoryObj = {
	render: () => html`
		<mo-list>${items}</mo-list>
	`
}

export const ItemsWithoutList: StoryObj = {
	render: () => items
}

export const CustomSubGridLayout: StoryObj = {
	render: () => html`
		<style>
			#custom {
				display: grid;
				grid-template-columns: auto 1fr auto;

				& > * {
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: subgrid;
				}

				.first-column-padding {
					display: inline-block;
				}
			}
		</style>
		<mo-list id='custom'>${items}</mo-list>
	`
}

export const WithCheckboxListItems: StoryObj = {
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

export const WithSwitchListItems: StoryObj = {
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
}

export const WithRadioListItems: StoryObj = {
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

export const WithCollapsibleListItems: StoryObj = {
	render: () => html`
		<mo-card heading='Navigation Menu' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-list-item>
					<mo-icon style='opacity: 0.66' icon='home'></mo-icon>
					Home
				</mo-list-item>

				<mo-collapsible-list-item>
					<mo-list-item>
						<mo-icon style='opacity: 0.66' icon='inventory_2'></mo-icon>
						Sales
					</mo-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Products</mo-list-item>
					<mo-collapsible-list-item slot='details'>
						<mo-list-item style='padding-inline-start: 56px; height: 40px'>Inventory</mo-list-item>
						<mo-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Inbound</mo-list-item>
						<mo-list-item slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Outbound</mo-list-item>
					</mo-collapsible-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Categories</mo-list-item>
					<mo-list-item slot='details' style='padding-inline-start: 56px; height: 40px'>Brands</mo-list-item>
				</mo-collapsible-list-item>
			</mo-list>
		</mo-card>
	`
}

export const Selectable: StoryObj = {
	render: () => html`
		<mo-card heading='Connectivity' style='--mo-card-body-padding: 0px'>
			<mo-list>
				<mo-selectable-list-item toggleable>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					WiFi
				</mo-selectable-list-item>

				<mo-selectable-list-item toggleable>
					<mo-icon style='opacity: 0.66' icon='bluetooth'></mo-icon>
					Bluetooth
				</mo-selectable-list-item>

				<mo-selectable-list-item toggleable>
					<mo-icon style='opacity: 0.66' icon='nfc'></mo-icon>
					NFC
				</mo-selectable-list-item>
			</mo-list>
		</mo-card>
	`
}

const getSelectableTemplate = (selectability: SelectableListSelectability) => html`
	Check the console for the selected item.
	<mo-selectable-list selectability=${selectability}>
		<mo-selectable-list-item toggleable>Item 1</mo-selectable-list-item>
		<mo-selectable-list-item toggleable>Item 2</mo-selectable-list-item>
		<mo-checkbox-list-item disabled>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 4</mo-checkbox-list-item>
		<mo-switch-list-item>Item 5</mo-switch-list-item>
		<mo-switch-list-item>Item 6</mo-switch-list-item>
		<mo-radio-list-item>Item 7</mo-radio-list-item>
		<mo-radio-list-item>Item 8</mo-radio-list-item>
	</mo-selectable-list>
`

export const WithSelectablitySingle: StoryObj = {
	render: () => getSelectableTemplate(SelectableListSelectability.Single)
}

export const WithSelectablityMultiple: StoryObj = {
	render: () => getSelectableTemplate(SelectableListSelectability.Multiple)
}

export const WithSelectabilityAndCollapsible: StoryObj = {
	render: () => html`
		<style>
			mo-collapsible-list-item:has(mo-selectable-list-item[selected]) > mo-list-item:not([slot]) {
				border: 2px dashed var(--mo-color-yellow);
			}
		</style>
		<mo-card id='with-selection' heading='Navigation Menu' style='--mo-card-body-padding: 0px'>
			<mo-selectable-list>
				<mo-selectable-list-item>
					<mo-icon style='opacity: 0.66' icon='home'></mo-icon>
					Home
				</mo-selectable-list-item>

				<mo-collapsible-list-item>
					<mo-list-item>
						<mo-icon style='opacity: 0.66' icon='inventory_2'></mo-icon>
						Sales
					</mo-list-item>
					<mo-selectable-list-item toggleable slot='details' style='padding-inline-start: 56px; height: 40px'>Products</mo-selectable-list-item>
					<mo-collapsible-list-item slot='details'>
						<mo-list-item style='padding-inline-start: 56px; height: 40px'>Inventory</mo-list-item>
						<mo-selectable-list-item toggleable slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Inbound</mo-selectable-list-item>
						<mo-selectable-list-item toggleable slot='details' style='padding-inline-start: 80px; color: var(--mo-color-gray); height: 35px'>Outbound</mo-selectable-list-item>
					</mo-collapsible-list-item>
					<mo-selectable-list-item toggleable slot='details' style='padding-inline-start: 56px; height: 40px'>Categories</mo-selectable-list-item>
					<mo-selectable-list-item toggleable slot='details' style='padding-inline-start: 56px; height: 40px'>Brands</mo-selectable-list-item>
				</mo-collapsible-list-item>
			</mo-selectable-list>
		</mo-card>
	`
}