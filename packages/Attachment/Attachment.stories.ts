import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { image } from '../../stories/index.js'
import './index.js'

type Args = {
	readonly name: string
	readonly size: number
	readonly removable: boolean
}

export default {
	title: 'Data / Attachment',
	component: 'mo-attachment',
	tags: ['status:preview'],
	args: {
		name: 'purchase-order-4471.pdf',
		size: 248_832,
	},
	decorators: [story => html`<div style='max-width: 24rem'>${story()}</div>`],
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ name, size }) => html`
		<mo-attachment name=${name} size=${size}></mo-attachment>
	`,
}

/** The extension of the name selects the icon and the type under the name, and the size takes the unit that fits it. */
export const Types: Story = {
	decorators: [story => html`<div style='display: grid; gap: 0.5rem'>${story()}</div>`],
	render: () => html`
		<mo-attachment name='terms-and-conditions.pdf' size='96256'></mo-attachment>
		<mo-attachment name='warehouse-entrance.jpg' size='1887436'></mo-attachment>
		<mo-attachment name='price-list.xlsx' size='41984'></mo-attachment>
		<mo-attachment name='shipment-notice.xml' size='870'></mo-attachment>
		<mo-attachment name='product-photos.zip' size='3221225472'></mo-attachment>
		<mo-attachment name='README'></mo-attachment>
	`,
}

/** `thumbnail` shows a preview image in place of the icon, which returns if the image cannot be loaded. */
export const Thumbnail: Story = {
	decorators: [story => html`<div style='display: grid; gap: 0.5rem'>${story()}</div>`],
	render: () => html`
		<mo-attachment name='warehouse-entrance.jpg' size='1887436' thumbnail=${image('warehouse', 160, 160)}></mo-attachment>
		<mo-attachment name='missing-preview.jpg' size='1887436' thumbnail='/no-such-image.jpg'></mo-attachment>
	`,
}

/** `href` makes the name a link to the file, and the whole attachment follows it. Prevent the default of `click` to open a preview of your own. */
export const Link: Story = {
	render: () => html`
		<mo-attachment name='sample.pdf' size='18810' href='https://pdfobject.com/pdf/sample.pdf' target='_blank'></mo-attachment>
	`,
}

/** `removable` renders the remove button, which dispatches `requestRemove`. The attachment stays until you take it away. */
export const Removable: Story = {
	args: {
		removable: true,
	},
	render: ({ name, size, removable }) => html`
		<mo-attachment name=${name} size=${size} ?removable=${removable}></mo-attachment>
	`,
}

/** The default slot replaces the line under the name, `action` adds controls before the remove button, and `media` replaces the icon. */
export const Slots: Story = {
	render: () => html`
		<mo-attachment removable name='return-label.pdf' href='https://pdfobject.com/pdf/sample.pdf' target='_blank'>
			Internal · added today
			<mo-icon slot='media' icon='local_shipping'></mo-icon>
			<mo-icon-button dense slot='action' icon='visibility_off'></mo-icon-button>
		</mo-attachment>
	`,
}

/** An attachment takes the width of its content where nothing gives it one, as in this wrapping row. */
export const Row: Story = {
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: start; gap: 0.5rem'>${story()}</div>`],
	render: () => html`
		<mo-attachment removable name='invoice.pdf' size='96256'></mo-attachment>
		<mo-attachment removable name='photo.jpg' size='2202009' thumbnail=${image('damage', 80, 80)}></mo-attachment>
	`,
}
