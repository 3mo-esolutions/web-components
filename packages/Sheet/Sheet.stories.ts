import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Sheet',
	component: 'mo-sheet',
	package: p,
} as Meta

function handleClick(this: HTMLElement) {
	const sheet = this.previousElementSibling as HTMLElement & { open: boolean }
	sheet.open = !sheet.open
}

export const BottomSheet: StoryObj = {
	render: () => html`
		<mo-sheet label='Options'>
			<mo-flex gap='10px' style='padding: 16px 24px 24px'>
				<mo-heading typography='heading4'>Options</mo-heading>
				<span>Sheets anchor to an edge of the viewport and are modal: the page behind them is inert until they are dismissed via the Escape key, the backdrop or the handle.</span>
				<mo-button type='elevated'>An Action</mo-button>
			</mo-flex>
		</mo-sheet>
		<mo-button @click=${handleClick}>Open bottom sheet</mo-button>
	`
}

export const SideSheet: StoryObj = {
	render: () => html`
		<mo-sheet placement='inline-end' label='Filters'>
			<mo-flex gap='10px' style='padding: 24px'>
				<mo-heading typography='heading4'>Filters</mo-heading>
				<mo-checkbox label='Only available'></mo-checkbox>
				<mo-checkbox label='Include archived'></mo-checkbox>
			</mo-flex>
		</mo-sheet>
		<mo-button @click=${handleClick}>Open side sheet</mo-button>
	`
}

export const NavigationPlacement: StoryObj = {
	name: 'Navigation Placement (inline-start)',
	render: () => html`
		<mo-sheet placement='inline-start' label='Navigation' style='--mo-sheet-size: 292px'>
			<mo-list style='padding-block: 8px'>
				<mo-list-item>Dashboard</mo-list-item>
				<mo-list-item>Orders</mo-list-item>
				<mo-list-item>Settings</mo-list-item>
			</mo-list>
		</mo-sheet>
		<mo-icon-button icon='menu' @click=${handleClick}></mo-icon-button>
	`
}

export const ScrollableContent: StoryObj = {
	render: () => html`
		<mo-sheet label='Terms'>
			<mo-flex gap='10px' style='padding: 16px 24px'>
				<mo-heading typography='heading4'>Terms</mo-heading>
				${new Array(50).fill(undefined).map((_, i) => html`<span>Paragraph ${i + 1} of a long scrollable content.</span>`)}
			</mo-flex>
		</mo-sheet>
		<mo-button @click=${handleClick}>Open scrollable sheet</mo-button>
	`
}

export const PreventedClose: StoryObj = {
	name: 'Prevented Close (veto via requestClose)',
	render: () => html`
		<mo-sheet label='Unsaved changes'
			@requestClose=${(e: CustomEvent<{ source: string }>) => ['escape', 'backdrop'].includes(e.detail.source) ? e.preventDefault() : void 0}
		>
			<mo-flex gap='10px' style='padding: 16px 24px 24px'>
				<span>This sheet refuses to be dismissed by accident: Escape and the backdrop are vetoed, while the handle and a swipe still close it.</span>
			</mo-flex>
		</mo-sheet>
		<mo-button @click=${handleClick}>Open stubborn sheet</mo-button>
	`
}

export const WithMenu: StoryObj = {
	name: 'With Menu (nested top-layer element)',
	render: () => html`
		<mo-sheet label='Nested popover'>
			<mo-flex gap='10px' style='padding: 16px 24px 24px'>
				<span>Popovers opened from sheet content render above the modal sheet.</span>
				<mo-popover-container placement='block-start'>
					<mo-button type='elevated'>Open menu</mo-button>
					<mo-menu slot='popover'>
						<mo-menu-item>Cut</mo-menu-item>
						<mo-menu-item>Copy</mo-menu-item>
						<mo-menu-item>Paste</mo-menu-item>
					</mo-menu>
				</mo-popover-container>
			</mo-flex>
		</mo-sheet>
		<mo-button @click=${handleClick}>Open sheet with menu</mo-button>
	`
}