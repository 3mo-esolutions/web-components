import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { DialogSize } from '@3mo/dialog'
import { DialogAlert } from './index.js'

export default {
	title: 'Feedback / Standard Dialogs / Alert Dialog',
	component: 'mo-dialog-alert',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; gap: 12px'>${story()}</div>`],
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogAlert({ heading: 'The order was shipped', content: 'It is expected to arrive on Friday.' }).confirm()}>Ship order</mo-button>
	`,
}

/** `primaryButtonText` replaces "OK", and `content` may be a template as well as text. */
export const Content: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogAlert({
			heading: '3 items are out of stock',
			primaryButtonText: 'Got it',
			content: html`
				The order ships once these are back:
				<ul>
					<li>Office chair</li>
					<li>Standing desk</li>
					<li>Monitor arm</li>
				</ul>
			`,
		}).confirm()}>Check stock</mo-button>
	`,
}

/** `blocking` hides the close button and ignores Escape, so only the button closes the dialog. */
export const Blocking: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogAlert({ heading: 'The session has expired', content: 'Sign in again to continue.', blocking: true }).confirm()}>Expire session</mo-button>
	`,
}

/** `size` gives the dialog a fixed width in place of fitting its content. */
export const Sizes: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogAlert({ heading: 'Small', content: 'A 480px wide dialog.', size: DialogSize.Small }).confirm()}>Small</mo-button>
		<mo-button @click=${() => new DialogAlert({ heading: 'Medium', content: 'A 1024px wide dialog.', size: DialogSize.Medium }).confirm()}>Medium</mo-button>
		<mo-button @click=${() => new DialogAlert({ heading: 'Large', content: 'A 1680px wide dialog that fills the height.', size: DialogSize.Large }).confirm()}>Large</mo-button>
	`,
}
