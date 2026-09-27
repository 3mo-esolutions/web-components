import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import type { SheetPlacement } from './SheetPlacement.js'
import './index.js'

type Args = {
	readonly placement: SheetPlacement
	readonly label: string
}

export default {
	title: 'Layout / Sheet',
	component: 'mo-sheet',
	args: {
		placement: 'block-end',
		label: 'Share',
	},
	argTypes: {
		placement: { control: 'select', options: ['block-end', 'block-start', 'inline-start', 'inline-end'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ placement, label }) => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' startIcon='share' @click=${() => setOpen(true)}>Share</mo-button>
			<mo-sheet placement=${placement} label=${label} ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-list style='padding-block: 8px'>
					<mo-list-item icon='insert_link'>Copy link</mo-list-item>
					<mo-list-item icon='mail'>Send by email</mo-list-item>
					<mo-list-item icon='download'>Download</mo-list-item>
				</mo-list>
			</mo-sheet>
		`
	},
}

/** A sheet comes in from the edge it is anchored to. Only the `block` placements have a handle. */
export const Placements: Story = {
	render: () => {
		const [placement, setPlacement] = useState<SheetPlacement>('block-end')
		const [open, setOpen] = useState(false)
		const show = (placement: SheetPlacement) => {
			setPlacement(placement)
			setOpen(true)
		}
		return html`
			<mo-flex direction='horizontal' gap='8px' wrap='wrap'>
				<mo-button type='outlined' @click=${() => show('block-end')}>Block end</mo-button>
				<mo-button type='outlined' @click=${() => show('block-start')}>Block start</mo-button>
				<mo-button type='outlined' @click=${() => show('inline-start')}>Inline start</mo-button>
				<mo-button type='outlined' @click=${() => show('inline-end')}>Inline end</mo-button>
			</mo-flex>
			<mo-sheet label='Filters' placement=${placement} ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-flex gap='10px' style='padding: 16px 24px 24px'>
					<mo-heading typography='heading4'>Filters</mo-heading>
					<mo-checkbox label='Only available'></mo-checkbox>
					<mo-checkbox label='Include archived'></mo-checkbox>
				</mo-flex>
			</mo-sheet>
		`
	},
}

/** Content taller than the sheet scrolls inside it, while the handle stays put. */
export const Scrollable: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Recent orders</mo-button>
			<mo-sheet label='Recent orders' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-list>
					${Array.from({ length: 50 }, (_, index) => html`<mo-list-item icon='receipt'>Order ${10400 + index}</mo-list-item>`)}
				</mo-list>
			</mo-sheet>
		`
	},
}

/**
 * Cancelling `requestClose` keeps the sheet open. Its `source` says what asked: this sheet ignores Escape and the backdrop,
 * while the handle and a swipe still close it.
 */
export const PreventedClose: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Edit note</mo-button>
			<mo-sheet label='Note'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
				@requestClose=${(event: CustomEvent<{ source: string }>) => ['escape', 'backdrop'].includes(event.detail.source) && event.preventDefault()}
			>
				<mo-flex gap='10px' style='padding: 16px 24px 24px'>
					<mo-field-text label='Note' autofocus></mo-field-text>
					<mo-button type='elevated' @click=${() => setOpen(false)}>Save</mo-button>
				</mo-flex>
			</mo-sheet>
		`
	},
}

/** Menus and popovers opened from the sheet render above it, and the field marked `autofocus` takes the focus as it opens. */
export const NestedPopover: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Edit text</mo-button>
			<mo-sheet label='Edit text' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				<mo-flex gap='10px' style='padding: 16px 24px 24px'>
					<mo-field-text label='Text' autofocus></mo-field-text>
					<mo-popover-container placement='block-start'>
						<mo-button type='elevated'>Clipboard</mo-button>
						<mo-menu slot='popover'>
							<mo-menu-item>Cut</mo-menu-item>
							<mo-menu-item>Copy</mo-menu-item>
							<mo-menu-item>Paste</mo-menu-item>
						</mo-menu>
					</mo-popover-container>
				</mo-flex>
			</mo-sheet>
		`
	},
}

/** `--mo-sheet-size` sets the width of a side sheet, and the corners, the backdrop and the motion have custom properties too. */
export const CustomProperties: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-icon-button icon='menu' @click=${() => setOpen(true)}></mo-icon-button>
			<mo-sheet placement='inline-start' label='Navigation'
				style='--mo-sheet-size: 292px; --mo-sheet-border-radius: 16px; --mo-sheet-scrim: rgb(0 0 0 / 0.6); --mo-sheet-duration: 400ms'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-list style='padding-block: 8px'>
					<mo-list-item icon='dashboard'>Dashboard</mo-list-item>
					<mo-list-item icon='receipt_long'>Orders</mo-list-item>
					<mo-list-item icon='settings'>Settings</mo-list-item>
				</mo-list>
			</mo-sheet>
		`
	},
}

/** The `panel`, `handle` and `content` parts can be styled from outside. */
export const Parts: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<style>
				#styled-sheet::part(panel) {
					margin-inline: auto;
					max-inline-size: 480px;
					background: var(--mo-color-surface-container-high);
				}

				#styled-sheet::part(handle)::before {
					inline-size: 4rem;
					background: var(--mo-color-accent);
				}

				#styled-sheet::part(content) {
					padding: 0 24px 24px;
				}
			</style>
			<mo-button type='outlined' @click=${() => setOpen(true)}>Order details</mo-button>
			<mo-sheet id='styled-sheet' label='Order details' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
				Shipped on 3 September to Nordwind GmbH, Hamburg.
			</mo-sheet>
		`
	},
}