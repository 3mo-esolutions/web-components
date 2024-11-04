import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { SelectableListSelectability } from './index.js'

type Args = {
	readonly selectability: SelectableListSelectability
}

export default {
	title: 'Data / List',
	component: 'mo-list',
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: () => html`
		<mo-list>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='inbox'></mo-icon>
				Inbox
			</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='drafts'></mo-icon>
				Drafts
			</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='send'></mo-icon>
				Sent
			</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='delete'></mo-icon>
				Trash
			</mo-list-item>
		</mo-list>
	`,
}

/** An item holds any content after the icon in its `start` slot, such as a shortcut in its `end` slot, and an element with `role='separator'` divides the groups. */
export const Content: Story = {
	render: () => html`
		<mo-list style='max-width: 360px'>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='inbox'></mo-icon>
				Inbox
				<mo-key slot='end'>Meta+I</mo-key>
			</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='drafts'></mo-icon>
				Drafts
				<mo-key slot='end'>Meta+D</mo-key>
			</mo-list-item>
			<div role='separator' style='height: 1px; background: var(--mo-color-transparent-gray-3)'></div>
			<mo-list-item>Trash</mo-list-item>
			<mo-list-item>Spam</mo-list-item>
			<div role='separator' style='height: 1px; background: var(--mo-color-transparent-gray-3)'></div>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='logout'></mo-icon>
				Sign out
			</mo-list-item>
		</mo-list>
	`,
}

/** A `disabled` item fades and ignores presses; an element inside it can still take them with `pointer-events: auto`. */
export const Disabled: Story = {
	render: () => html`
		<mo-list style='max-width: 360px'>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='inbox'></mo-icon>
				Inbox
			</mo-list-item>
			<mo-list-item disabled>
				<mo-icon slot='start' style='opacity: 0.66' icon='archive'></mo-icon>
				Archive
			</mo-list-item>
			<mo-list-item disabled style='opacity: 1'>
				<mo-icon slot='start' style='opacity: 0.33' icon='settings_suggest'></mo-icon>
				<span>
					<span style='opacity: 0.5'>Personalization -</span>
					<mo-anchor style='pointer-events: auto'>Upgrade to Pro</mo-anchor>
				</span>
			</mo-list-item>
		</mo-list>
	`,
}

/** A list laid out as a grid whose items take its columns through `subgrid` lines up the icons, labels and shortcuts of all items. */
export const SubgridLayout: Story = {
	render: () => html`
		<style>
			.subgrid {
				display: grid;
				grid-template-columns: auto 1fr auto;
				max-width: 360px;

				& > * {
					grid-column: 1 / -1;
					display: grid;
					grid-template-columns: subgrid;
				}
			}
		</style>
		<mo-list class='subgrid'>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='inbox'></mo-icon>
				Inbox
				<mo-key slot='end'>Meta+I</mo-key>
			</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='drafts'></mo-icon>
				Drafts
				<mo-key slot='end'>Meta+D</mo-key>
			</mo-list-item>
			<mo-list-item>Trash</mo-list-item>
			<mo-list-item>
				<mo-icon slot='start' style='opacity: 0.66' icon='logout'></mo-icon>
				Sign out
				<mo-key slot='end'>Meta+Shift+Q</mo-key>
			</mo-list-item>
		</mo-list>
	`,
}

/** `mo-checkbox-list-item` makes the whole item the label of its checkbox. */
export const CheckboxItems: Story = {
	render: () => html`
		<mo-card heading='Connectivity' style='max-width: 360px; --mo-card-body-padding: 0px'>
			<mo-list>
				<mo-checkbox-list-item selected>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					Wi-Fi
				</mo-checkbox-list-item>
				<mo-checkbox-list-item>
					<mo-icon style='opacity: 0.66' icon='bluetooth'></mo-icon>
					Bluetooth
				</mo-checkbox-list-item>
				<mo-checkbox-list-item indeterminate>
					<mo-icon style='opacity: 0.66' icon='nfc'></mo-icon>
					NFC
				</mo-checkbox-list-item>
			</mo-list>
		</mo-card>
	`,
}

/** `mo-switch-list-item` does the same for a switch. */
export const SwitchItems: Story = {
	render: () => html`
		<mo-card heading='Connectivity' style='max-width: 360px; --mo-card-body-padding: 0px'>
			<mo-list>
				<mo-switch-list-item selected>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					Wi-Fi
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
	`,
}

/** `mo-radio-list-item` does the same for a radio button. */
export const RadioItems: Story = {
	render: () => html`
		<mo-card heading='Notifications' style='max-width: 360px; --mo-card-body-padding: 0px'>
			<mo-list>
				<mo-radio-list-item selected>
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
	`,
}

/** `selectionControlAlignment='start'` places the control before the content instead of at its end. */
export const SelectionControlAlignment: Story = {
	render: () => html`
		<mo-list style='max-width: 360px'>
			<mo-checkbox-list-item selectionControlAlignment='start' selected>Wi-Fi</mo-checkbox-list-item>
			<mo-switch-list-item selectionControlAlignment='start'>Bluetooth</mo-switch-list-item>
			<mo-radio-list-item selectionControlAlignment='start'>NFC</mo-radio-list-item>
		</mo-list>
	`,
}

/** A `toggleable` selectable item is selected and deselected by a press, and shows its state by its background. */
export const SelectableItems: Story = {
	render: () => html`
		<mo-card heading='Connectivity' style='max-width: 360px; --mo-card-body-padding: 0px'>
			<mo-list>
				<mo-selectable-list-item toggleable>
					<mo-icon style='opacity: 0.66' icon='wifi'></mo-icon>
					Wi-Fi
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
	`,
}

/** `mo-collapsible-list-item` opens its `details` below the item it holds, to any depth. */
export const CollapsibleItems: Story = {
	render: () => html`
		<mo-card heading='Navigation' style='max-width: 360px; --mo-card-body-padding: 0px'>
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
	`,
}

/** `mo-selectable-list` keeps one selection over all its selectable items, whatever their control, as their indices in `value`; arrow keys move between them. */
export const SelectableList: Story = {
	args: {
		selectability: SelectableListSelectability.Single,
	},
	argTypes: {
		selectability: { control: 'inline-radio', options: [SelectableListSelectability.Single, SelectableListSelectability.Multiple] },
	},
	render: ({ selectability }) => html`
		<mo-selectable-list selectability=${selectability} style='max-width: 360px'>
			<mo-selectable-list-item toggleable>Item 1</mo-selectable-list-item>
			<mo-selectable-list-item toggleable>Item 2</mo-selectable-list-item>
			<mo-checkbox-list-item disabled>Item 3</mo-checkbox-list-item>
			<mo-checkbox-list-item>Item 4</mo-checkbox-list-item>
			<mo-checkbox-list-item>Item 5</mo-checkbox-list-item>
			<mo-switch-list-item>Item 6</mo-switch-list-item>
			<mo-switch-list-item>Item 7</mo-switch-list-item>
			<mo-radio-list-item>Item 8</mo-radio-list-item>
			<mo-radio-list-item>Item 9</mo-radio-list-item>
		</mo-selectable-list>
	`,
}

/** Selectable items inside collapsible ones join the list's selection too; here `:has()` outlines the group that holds it. */
export const SelectableCollapsibleItems: Story = {
	render: () => html`
		<style>
			mo-collapsible-list-item:has(mo-selectable-list-item[selected]) > mo-list-item:not([slot]) {
				outline: 2px dashed var(--mo-color-yellow);
				outline-offset: -2px;
			}
		</style>
		<mo-card heading='Navigation' style='max-width: 360px; --mo-card-body-padding: 0px'>
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
	`,
}