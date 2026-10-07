import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { sourceOf } from '../../.storybook/source.js'
import { DialogSize } from './index.js'
import renameDialogSource from './stories/RenameDialog.ts?raw'
import customerDialogSource from './stories/CustomerDialog.ts?raw'
import exportDialogSource from './stories/ExportDialog.ts?raw'
import { RenameDialog } from './stories/RenameDialog.js'
import { CustomerDialog } from './stories/CustomerDialog.js'
import { ExportDialog } from './stories/ExportDialog.js'
import '@3mo/text-fields'
import '@3mo/select-field'

type Args = {
	readonly heading: string
	readonly primaryButtonText: string
	readonly secondaryButtonText: string
	readonly blocking: boolean
}

export default {
	title: 'Layout / Dialog',
	component: 'mo-dialog',
	args: {
		heading: 'Discard draft?',
		primaryButtonText: 'Discard',
		secondaryButtonText: 'Keep editing',
		blocking: false,
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ heading, primaryButtonText, secondaryButtonText, blocking }) => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Discard draft</mo-button>
			<mo-dialog heading=${heading} primaryButtonText=${primaryButtonText} secondaryButtonText=${secondaryButtonText} ?blocking=${blocking}
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				The draft and its attachments will be deleted.
			</mo-dialog>
		`
	},
}

/** `small`, `medium` and `large` set the width, and `large` also fills the height; without a size the dialog fits its content. */
export const Sizes: Story = {
	render: () => {
		const [size, setSize] = useState(DialogSize.Small)
		const [open, setOpen] = useState(false)
		const show = (size: DialogSize) => {
			setSize(size)
			setOpen(true)
		}
		return html`
			<mo-flex direction='horizontal' gap='8px'>
				<mo-button type='outlined' @click=${() => show(DialogSize.Small)}>Small</mo-button>
				<mo-button type='outlined' @click=${() => show(DialogSize.Medium)}>Medium</mo-button>
				<mo-button type='outlined' @click=${() => show(DialogSize.Large)}>Large</mo-button>
			</mo-flex>
			<mo-dialog heading='Order 10482' primaryButtonText='Done' size=${size}
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				Two items, shipped on 3 September to Nordwind GmbH, Hamburg.
			</mo-dialog>
		`
	},
}

/** Content taller than the window scrolls between the header and the footer, and a select field's options still open over it. */
export const Scrollable: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>New customer</mo-button>
			<mo-dialog heading='New customer' primaryButtonText='Create' size='small'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-flex gap='12px'>
					<mo-field-text label='Company'></mo-field-text>
					<mo-field-text label='Contact person'></mo-field-text>
					<mo-field-text label='Email'></mo-field-text>
					<mo-field-text label='Phone'></mo-field-text>
					<mo-field-select label='Country'>
						${['Austria', 'Belgium', 'Denmark', 'France', 'Germany', 'Italy', 'Luxembourg', 'Netherlands', 'Poland', 'Spain', 'Sweden', 'Switzerland'].map(country => html`
							<mo-option value=${country}>${country}</mo-option>
						`)}
					</mo-field-select>
					<mo-field-text label='Street'></mo-field-text>
					<mo-field-text label='Postal code'></mo-field-text>
					<mo-field-text label='City'></mo-field-text>
					<mo-field-text label='VAT number'></mo-field-text>
					<mo-field-text label='Customer number'></mo-field-text>
					<mo-field-text label='Notes'></mo-field-text>
				</mo-flex>
			</mo-dialog>
		`
	},
}

/** The `primaryAction` and `secondaryAction` slots take buttons of your own in place of the button texts. */
export const ActionSlots: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Edit article</mo-button>
			<mo-dialog heading='Article 2041'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-loading-button slot='primaryAction' type='elevated' startIcon='save'>Save</mo-loading-button>
				<mo-loading-button slot='secondaryAction' type='outlined' startIcon='delete' style='--mo-button-accent-color: var(--mo-color-red)'>Delete</mo-loading-button>
				Office chair, black, in stock.
			</mo-dialog>
		`
	},
}

/** The `action` slot adds to the header, before the close button. */
export const HeaderActions: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Open invoice</mo-button>
			<mo-dialog heading='Invoice 2026-0815'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-icon-button slot='action' icon='print'></mo-icon-button>
				<mo-icon-button slot='action' icon='edit'></mo-icon-button>
				<span slot='action' style='flex: 1; font-size: small'>
					<span style='padding-inline: 5px; border-radius: 4px; color: white; background: var(--mo-color-green)'>Paid</span>
				</span>
				Paid on 12 September by bank transfer.
			</mo-dialog>
		`
	},
}

/** The `footer` slot fills the footer beside the actions. */
export const Footer: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Write a note</mo-button>
			<mo-dialog heading='Note' primaryButtonText='Save'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-checkbox slot='footer' label='Save as draft'></mo-checkbox>
				<mo-field-text label='Note'></mo-field-text>
			</mo-dialog>
		`
	},
}

/** A `blocking` dialog has no close button and ignores Escape and the backdrop, so only one of its actions closes it. */
export const Blocking: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Accept terms</mo-button>
			<mo-dialog heading='Terms of service' primaryButtonText='Accept' secondaryButtonText='Decline' blocking
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				The terms have changed. Accept them to continue.
			</mo-dialog>
		`
	},
}

/** The field marked `autofocus` takes the focus as the dialog opens. */
export const AutoFocus: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Sign in</mo-button>
			<mo-dialog heading='Sign in' primaryButtonText='Continue'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				<mo-flex gap='8px'>
					<mo-field-text label='Workspace'></mo-field-text>
					<mo-field-text label='Username' autofocus></mo-field-text>
				</mo-flex>
			</mo-dialog>
		`
	},
}

/** Opened in a tab of its own, as "Open as Tab" in the header does, a dialog is laid out as a page filling the window. */
export const BoundToWindow: Story = {
	render: () => html`
		<mo-dialog heading='Order 10482' .boundToWindow=${true}>
			Two items, shipped on 3 September to Nordwind GmbH, Hamburg.
		</mo-dialog>
	`,
}

/** The host's `background` colors the surface, and custom properties color the heading, the content and the backdrop. */
export const CustomProperties: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' @click=${() => setOpen(true)}>Open</mo-button>
			<mo-dialog heading='Welcome back' primaryButtonText='Continue'
				style='
					background: linear-gradient(90deg, color-mix(in srgb, var(--mo-color-red), var(--mo-color-surface)), color-mix(in srgb, var(--mo-color-blue), var(--mo-color-surface)));
					--mo-dialog-heading-color: white;
					--mo-dialog-content-color: white;
					--mo-dialog-backdrop: linear-gradient(135deg, rgb(0 119 200 / 0.6), rgb(0 0 0 / 0.85));
				'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				Three orders arrived while you were away.
			</mo-dialog>
		`
	},
}

/** The `header`, `heading`, `content` and `footer` parts can be styled from outside. */
export const Parts: Story = {
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<style>
				#styled-dialog::part(header) {
					background: linear-gradient(90deg, color-mix(in srgb, var(--mo-color-red), var(--mo-color-surface)), color-mix(in srgb, var(--mo-color-blue), var(--mo-color-surface)));
				}

				#styled-dialog::part(footer) {
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				}
			</style>
			<mo-button type='outlined' @click=${() => setOpen(true)}>Open</mo-button>
			<mo-dialog id='styled-dialog' heading='Release notes' primaryButtonText='Got it'
				?open=${open}
				@openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}
			>
				Version 4.2 adds dark mode and faster search.
			</mo-dialog>
		`
	},
}

/**
 * An application writes a dialog as a component whose template holds the `mo-dialog`, and `confirm()` opens it.
 * Its primary action runs as the button spins, and the promise resolves with what it returns.
 */
export const DialogComponent: Story = {
	parameters: sourceOf(renameDialogSource),
	render: () => {
		const [name, setName] = useState('Invoice 2026-0815.pdf')
		return html`
			<mo-flex direction='horizontal' alignItems='center' gap='8px'>
				<mo-icon icon='description'></mo-icon>
				<span>${name}</span>
				<mo-icon-button icon='edit' @click=${async () => setName(await new RenameDialog({ name }).confirm())}></mo-icon-button>
			</mo-flex>
		`
	},
}

/** A `mo-fetchable-dialog` in a `FetchableDialogComponent` stays loading until the entity of the given `id` is fetched. */
export const FetchableDialog: Story = {
	parameters: sourceOf(customerDialogSource),
	render: () => html`
		<mo-button type='outlined' @click=${() => new CustomerDialog({ id: 1 }).confirm()}>Edit customer</mo-button>
	`,
}

/** A split button can be the primary action: its main button spins while the action runs, and its menu offers variants. */
export const SplitButtonAction: Story = {
	parameters: sourceOf(exportDialogSource),
	render: () => html`
		<mo-button type='outlined' @click=${() => new ExportDialog().confirm()}>Export</mo-button>
	`,
}
