import type { Meta, StoryObj } from '@storybook/web-components'
import { Component, css, html, property } from '@a11d/lit'
import p from './package.json'
import { PopoverAlignment, PopoverPlacement } from './index.js'

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

const handleClick = (e: Event) => {
	const popover = (e.target as HTMLElement).closest('mo-popover-container')?.querySelector('mo-popover')
	popover?.toggleAttribute('open')
}

export const Manual: StoryObj = {
	render: ({ placement, alignment }) => {
		return html`
			<mo-popover-container placement=${placement} alignment=${alignment} @click=${handleClick}>
				<mo-button type='outlined'>Click to open the popover</mo-button>
				<mo-popover manual slot='popover' @click=${(e: Event) => e.stopPropagation()}>${content}</mo-popover>
			</mo-popover-container>
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

export const Absolute: StoryObj = {
	render: ({ placement, alignment }) => {
		return html`
			<mo-popover-container placement=${placement} alignment=${alignment}>
				<mo-button type='outlined'>Click to open the popover</mo-button>
				<mo-popover slot='popover'>${content}</mo-popover>
			</mo-popover-container>
		`
	}
}

export const CatalogAbsolute: StoryObj = {
	render: () => {
		return html`
			<mo-flex alignItems='center' justifyContent='center' style='margin: auto; height: 500px'>
				<mo-story-popover-catalog></mo-story-popover-catalog>
			</mo-flex>
		`
	}
}

export const CatalogFixed: StoryObj = {
	render: () => {
		return html`
			<mo-flex alignItems='center' justifyContent='center' style='margin: auto; height: 500px'>
				<mo-story-popover-catalog fixed></mo-story-popover-catalog>
			</mo-flex>
		`
	}
}

export const Fixed: StoryObj = {
	render: ({ placement, alignment }) => {
		return html`
			<mo-popover-container fixed placement=${placement} alignment=${alignment}>
				<mo-button type='outlined'>Click to open the popover</mo-button>
				<mo-popover slot='popover'>${content}</mo-popover>
			</mo-popover-container>
		`
	}
}

class StoryPopoverCatalog extends Component {
	@property({ type: Boolean }) fixed = false

	static override get styles() {
		return css`
			mo-button {
				width: 600px;
				height: 200px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-button type='outlined'>Click to open the popover</mo-button>
			${this.getCardTemplate(PopoverAlignment.Start, PopoverPlacement.BlockStart)}
			${this.getCardTemplate(PopoverAlignment.Start, PopoverPlacement.BlockEnd)}
			${this.getCardTemplate(PopoverAlignment.Start, PopoverPlacement.InlineStart)}
			${this.getCardTemplate(PopoverAlignment.Start, PopoverPlacement.InlineEnd)}
			${this.getCardTemplate(PopoverAlignment.Center, PopoverPlacement.BlockStart)}
			${this.getCardTemplate(PopoverAlignment.Center, PopoverPlacement.BlockEnd)}
			${this.getCardTemplate(PopoverAlignment.Center, PopoverPlacement.InlineStart)}
			${this.getCardTemplate(PopoverAlignment.Center, PopoverPlacement.InlineEnd)}
			${this.getCardTemplate(PopoverAlignment.End, PopoverPlacement.BlockStart)}
			${this.getCardTemplate(PopoverAlignment.End, PopoverPlacement.BlockEnd)}
			${this.getCardTemplate(PopoverAlignment.End, PopoverPlacement.InlineStart)}
			${this.getCardTemplate(PopoverAlignment.End, PopoverPlacement.InlineEnd)}
		`
	}

	protected getCardTemplate(alignment: PopoverAlignment, placement: PopoverPlacement) {
		return html`
			<mo-popover manual .anchor=${this} ?fixed=${this.fixed} open placement=${placement} alignment=${alignment}>
				<mo-card>
					<code>${alignment} / ${placement}</code>
				</mo-card>
			</mo-popover>
		`
	}
}

customElements.define('mo-story-popover-catalog', StoryPopoverCatalog)