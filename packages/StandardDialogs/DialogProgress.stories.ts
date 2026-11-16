import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import paymentDialogSource from './stories/PaymentDialog.ts?raw'
import { PaymentDialog } from './stories/PaymentDialog.js'
import { DialogAlert, DialogProgress } from './index.js'

export default {
	title: 'Feedback / Standard Dialogs / Progress Dialog',
	component: 'mo-dialog-progress',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogProgress({
			heading: 'The invoice is being generated…',
			action: () => new Promise(resolve => setTimeout(resolve, 2000)),
		}).confirm()}>Generate invoice</mo-button>
	`,
}

/** `content` appears below the progress indicator, as text or a template. */
export const Content: StoryObj = {
	render: () => html`
		<mo-button @click=${() => new DialogProgress({
			heading: 'Orders are being exported…',
			content: html`Every order of this year goes into one spreadsheet.<br>This may take a minute.`,
			action: () => new Promise(resolve => setTimeout(resolve, 3000)),
		}).confirm()}>Export orders</mo-button>
	`,
}

/** `confirm()` resolves with what the action returns once the dialog has closed. */
export const Result: StoryObj = {
	render: () => html`
		<mo-button @click=${async () => {
			const invoiceNumber = await new DialogProgress({
				heading: 'The invoice is being generated…',
				action: () => new Promise<number>(resolve => setTimeout(() => resolve(4711), 2000)),
			}).confirm()
			await new DialogAlert({ heading: `Invoice ${invoiceNumber} is ready`, content: 'It was attached to the order.' }).confirm()
		}}>Generate invoice</mo-button>
	`,
}

/** When the action fails, the dialog closes and `confirm()` rejects with the error, for the caller to handle. */
export const Failure: StoryObj = {
	render: () => html`
		<mo-button @click=${async () => {
			try {
				await new DialogProgress({
					heading: 'The invoice is being generated…',
					action: () => new Promise((_, reject) => setTimeout(() => reject(new Error('The PDF service is unavailable.')), 2000)),
				}).confirm()
			} catch (error) {
				await new DialogAlert({ heading: 'The invoice could not be generated', content: (error as Error).message }).confirm()
			}
		}}>Generate invoice</mo-button>
	`,
}

/** A subclass overriding `indicatorTemplate` replaces the spinner, here with a contactless icon while a card payment is awaited. */
export const Indicator: StoryObj = {
	parameters: sourceOf(paymentDialogSource),
	render: () => html`
		<mo-button @click=${() => new PaymentDialog({
			heading: 'The payment is being processed…',
			content: 'Hold the card against the terminal.',
			action: () => new Promise(resolve => setTimeout(resolve, 4000)),
		}).confirm()}>Pay by card</mo-button>
	`,
}
