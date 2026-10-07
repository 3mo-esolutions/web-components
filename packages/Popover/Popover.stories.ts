import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { type PopoverAlignment, type PopoverPlacement, popover } from './index.js'
import '@3mo/chip'

type Args = {
	readonly placement: PopoverPlacement
	readonly alignment: PopoverAlignment
}

export default {
	title: 'Layout / Popover',
	component: 'mo-popover',
	args: {
		placement: 'block-end' as PopoverPlacement,
		alignment: 'start' as PopoverAlignment,
	},
	argTypes: {
		placement: { control: 'select', options: ['block-start', 'block-end', 'inline-start', 'inline-end'] },
		alignment: { control: 'select', options: ['start', 'center', 'end'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ placement, alignment }) => html`
		<mo-popover-container placement=${placement} alignment=${alignment}>
			<mo-button type='outlined'>Delivery</mo-button>
			<mo-popover slot='popover'>
				<mo-card heading='Delivery'>Two to four working days within the EU.</mo-card>
			</mo-popover>
		</mo-popover-container>
	`,
}

/** `placement` picks the side of the anchor and `alignment` how the popover lines up along it; a popover that does not fit flips to the opposite side. */
export const Placements: Story = {
	decorators: [story => html`<div style='display: grid; place-items: center; min-height: 480px'>${story()}</div>`],
	render: () => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-button type='outlined' style='anchor-name: --placements; width: 480px; height: 160px' @click=${() => setOpen(!open)}>Show every placement</mo-button>
			${['block-start', 'block-end', 'inline-start', 'inline-end'].flatMap(placement => ['start', 'center', 'end'].map(alignment => html`
				<mo-popover mode='manual' placement=${placement} alignment=${alignment} style='position-anchor: --placements' ?open=${open}>
					<mo-card><code>${placement} ${alignment}</code></mo-card>
				</mo-popover>
			`))}
		`
	},
}

/** `target` names the element within the anchor that opens the popover: only the icon button does here. */
export const Target: Story = {
	render: ({ placement, alignment }) => html`
		<mo-popover-container placement=${placement} alignment=${alignment}>
			<mo-button type='outlined'>
				Shipping
				<mo-icon-button id='shipping-info' slot='end' icon='info'></mo-icon-button>
			</mo-button>
			<mo-popover slot='popover' target='shipping-info'>
				<mo-card heading='Shipping'>Orders placed before 4pm leave the same day.</mo-card>
			</mo-popover>
		</mo-popover-container>
	`,
}

/** `mode='manual'` leaves opening and closing to `open`: neither a click outside nor Escape closes it. */
export const Manual: Story = {
	render: ({ placement, alignment }) => {
		const [open, setOpen] = useState(false)
		return html`
			<mo-popover-container placement=${placement} alignment=${alignment}>
				<mo-button type='outlined' @click=${() => setOpen(!open)}>Toggle</mo-button>
				<mo-popover slot='popover' mode='manual' ?open=${open} @openChange=${(event: CustomEvent<boolean>) => setOpen(event.detail)}>
					<mo-card heading='Pinned'>Stays open until toggled again.</mo-card>
				</mo-popover>
			</mo-popover-container>
		`
	},
}

/** The element marked `autofocus` takes the focus as the popover opens, and the focus returns to the anchor as it closes. */
export const Focus: Story = {
	render: ({ placement, alignment }) => html`
		<mo-popover-container placement=${placement} alignment=${alignment}>
			<mo-button type='outlined'>Rename</mo-button>
			<mo-popover slot='popover'>
				<mo-card>
					<mo-field-text label='Name' autofocus></mo-field-text>
				</mo-card>
			</mo-popover>
		</mo-popover-container>
	`,
}

/**
 * `popover()` with a `trigger` renders nothing until the anchor is first used, so a hundred chips cost no popovers.
 * Each one shows when it was built, and keeps its instance when opened again.
 */
export const Lazy: Story = {
	render: () => html`
		<mo-flex direction='horizontal' wrap='wrap' gap='6px'>
			${Array.from({ length: 100 }, (_, index) => html`
				<mo-chip ${popover(() => html`
					<mo-popover>
						<mo-card heading='Popover ${index + 1}'>Built at ${new Date().toLocaleTimeString()}</mo-card>
					</mo-popover>
				`, { trigger: 'click' })}>${index + 1}</mo-chip>
			`)}
		</mo-flex>
	`,
}

/* eslint-disable @html-eslint/use-baseline */

/**
 * A popover is a native popover element, so the platform's `popovertarget` and `commandfor` buttons toggle it and anchor it to themselves.
 * `commandfor` needs a browser with Invoker Commands.
 */
export const PlatformInvokers: Story = {
	render: ({ placement, alignment }) => html`
		<mo-flex direction='horizontal' gap='1rem'>
			<button popovertarget='popover-target-demo'>popovertarget</button>
			<mo-popover id='popover-target-demo' placement=${placement} alignment=${alignment}>
				<mo-card heading='popovertarget'>Opened by the browser.</mo-card>
			</mo-popover>

			<button commandfor='command-for-demo' command='toggle-popover'>commandfor</button>
			<mo-popover id='command-for-demo' placement=${placement} alignment=${alignment}>
				<mo-card heading='commandfor'>Opened by the browser.</mo-card>
			</mo-popover>
		</mo-flex>
	`,
}
