import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html } from '@a11d/lit'
import p from './package.json'
import { PopoverAlignment, PopoverPlacement, type PopoverContainer } from './index.js'

export default {
	title: 'Popover',
	component: 'mo-popover',
	args: {
		placement: 'block-start',
		alignment: 'start',
	},
	argTypes: {
		placement: {
			control: 'select',
			options: ['block-start', 'block-end', 'inline-start', 'inline-end'],
		},
		alignment: {
			control: 'select',
			options: ['start', 'center', 'end'],
		},
	},
	package: p,
} as Meta

/* eslint-disable @html-eslint/use-baseline */
const content = html`
	<input autofocus>
	<mo-card heading='Popover'>
		Here some content
	</mo-card>
`

export const Popover: StoryObj = {
	render: ({ placement, alignment }) => {
		return html`
			<mo-popover-container placement=${placement} alignment=${alignment}>
				<mo-button type='outlined'>Click to open the popover</mo-button>
				<mo-popover slot='popover'>${content}</mo-popover>
			</mo-popover-container>
		`
	}
}

export const Manual: StoryObj = {
	render: ({ placement, alignment }) => {
		const handleClick = (e: Event) => {
			((e.target as HTMLElement).previousElementSibling as PopoverContainer)
				?.popoverElement
				?.toggleAttribute('open')
		}
		return html`
			<mo-flex direction='horizontal' gap='1rem'>
				<mo-popover-container placement=${placement} alignment=${alignment}>
					<mo-button disabled type='outlined'>Anchor</mo-button>
					<mo-popover slot='popover' mode='manual' @click=${(e: Event) => e.stopPropagation()}>${content}</mo-popover>
				</mo-popover-container>
				<mo-button type='outlined' @click=${handleClick}>Click here to toggle the popover instead!</mo-button>
			</mo-flex>
		`
	}
}

export const Target: StoryObj = {
	render: ({ placement, alignment }) => {
		return html`
			<mo-popover-container placement=${placement} alignment=${alignment}>
				<mo-button type='outlined'>
					Click on the icon-button to open the popover
					<mo-icon-button id='icon-button' slot='end' icon='expand_more'></mo-icon-button>
				</mo-button>
				<mo-popover slot='popover' target='icon-button'>${content}</mo-popover>
			</mo-popover-container>
		`
	}
}

export const AnchorPositioning: StoryObj = {
	render: () => {
		return html`
			<mo-flex alignItems='center' justifyContent='center' style='margin: auto; height: 500px'>
				<mo-story-popover-anchor-positioning></mo-story-popover-anchor-positioning>
			</mo-flex>
		`
	}
}

class StoryPopoverAnchorPositioning extends Component {
	static override get styles() {
		return css`
			:host { anchor-name: --story-popover-catalog; }

			mo-button {
				width: 600px;
				height: 200px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-button type='outlined'>Click to open the popover</mo-button>
			${this.getCardTemplate(PopoverPlacement.InlineStart, PopoverAlignment.Start)}
			${this.getCardTemplate(PopoverPlacement.InlineStart, PopoverAlignment.Center)}
			${this.getCardTemplate(PopoverPlacement.InlineStart, PopoverAlignment.End)}
			${this.getCardTemplate(PopoverPlacement.BlockStart, PopoverAlignment.Start)}
			${this.getCardTemplate(PopoverPlacement.BlockStart, PopoverAlignment.Center)}
			${this.getCardTemplate(PopoverPlacement.BlockStart, PopoverAlignment.End)}
			${this.getCardTemplate(PopoverPlacement.InlineEnd, PopoverAlignment.Start)}
			${this.getCardTemplate(PopoverPlacement.InlineEnd, PopoverAlignment.Center)}
			${this.getCardTemplate(PopoverPlacement.InlineEnd, PopoverAlignment.End)}
			${this.getCardTemplate(PopoverPlacement.BlockEnd, PopoverAlignment.Start)}
			${this.getCardTemplate(PopoverPlacement.BlockEnd, PopoverAlignment.Center)}
			${this.getCardTemplate(PopoverPlacement.BlockEnd, PopoverAlignment.End)}
		`
	}

	protected getCardTemplate(placement: PopoverPlacement, alignment: PopoverAlignment) {
		return html`
			<mo-popover mode='manual' .anchor=${this} open placement=${placement} alignment=${alignment}>
				<mo-card>
					<code>${placement} / ${alignment}</code>
				</mo-card>
			</mo-popover>
		`
	}
}

customElements.define('mo-story-popover-anchor-positioning', StoryPopoverAnchorPositioning)