import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, property, state, style } from '@a11d/lit'
import p from './package.json'
import { PopoverAlignment, PopoverPlacement, popover, type PopoverContainer } from './index.js'
import '@3mo/chip'

export default {
	title: 'Layout & Containment / Popover',
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

export const Lazy: StoryObj = {
	render: () => html`<mo-story-popover-lazy></mo-story-popover-lazy>`
}

const clock = (date: Date) => date.toLocaleTimeString(undefined, { hour12: false })

/**
 * Ages from freshly built to settled, so that a popover materialized by an interaction is
 * distinguishable from one merely re-opened with the instance it already has.
 */
class StoryPopoverLazyDetails extends Component {
	@property({ type: Object }) pageRenderedAt = new Date()

	private readonly createdAt = new Date()
	@state() private settled = false

	override connected() {
		setTimeout(() => this.settled = true, 2000)
	}

	protected override get template() {
		const seconds = Math.round((this.createdAt.getTime() - this.pageRenderedAt.getTime()) / 1000)
		return html`
			<mo-flex gap='0.5rem'>
				<div>Built at <strong>${clock(this.createdAt)}</strong>, ${seconds} seconds after the page rendered.</div>
				<div ${style({ padding: '0.4rem 0.6rem', borderRadius: 'var(--mo-border-radius)', color: '#101010', backgroundColor: this.settled ? '#7FCDCD' : '#F7CAC9' })}>
					${this.settled ? '✅ Settled — re-opening keeps this instance' : '⌛ Just built by the interaction opening it'}
				</div>
			</mo-flex>
		`
	}
}

customElements.define('mo-story-popover-lazy-details', StoryPopoverLazyDetails)

class StoryPopoverLazy extends Component {
	private static readonly anchorsCount = 100

	private readonly renderedAt = new Date()
	@state() private materializedCount = 0

	private readonly observer = new MutationObserver(() => this.countMaterialized())

	override connectedCallback() {
		super.connectedCallback()
		this.updateComplete.then(() => this.observer.observe(this.renderRoot, { childList: true, subtree: true }))
	}

	override disconnectedCallback() {
		this.observer.disconnect()
		super.disconnectedCallback()
	}

	private countMaterialized() {
		this.materializedCount = this.renderRoot.querySelectorAll('mo-popover').length
	}

	static override get styles() {
		return css`
			#anchors {
				display: flex;
				flex-wrap: wrap;
				gap: 0.4rem;
			}

			code {
				background: var(--mo-color-transparent-gray-3);
				padding: 0.1rem 0.3rem;
				border-radius: var(--mo-border-radius);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex gap='1rem'>
				<mo-card>
					<mo-flex gap='0.5rem'>
						<div>
							<strong>${this.materializedCount}</strong> of ${StoryPopoverLazy.anchorsCount} popovers exist in the DOM.
							The page itself rendered at <strong>${clock(this.renderedAt)}</strong>.
						</div>
						<div>
							Every chip declares its popover through
							<code>\${popover(() => html\`…\`, { trigger: 'click' })}</code>,
							which renders nothing until the chip is clicked. Each popover therefore reports the moment
							it was built rather than the moment the page was, and stays red for two seconds afterwards.
							Re-opening a chip shows the same settled instance, as the popover keeps triggering itself
							once it exists.
						</div>
					</mo-flex>
				</mo-card>

				<div id='anchors'>
					${new Array(StoryPopoverLazy.anchorsCount).fill(undefined).map((_, index) => html`
						<mo-chip
							${popover(() => html`
								<mo-popover>
									<mo-card heading='Popover ${index + 1}'>
										<mo-story-popover-lazy-details .pageRenderedAt=${this.renderedAt}></mo-story-popover-lazy-details>
									</mo-card>
								</mo-popover>
							`, { trigger: 'click' })}
						>${index + 1}</mo-chip>
					`)}
				</div>
			</mo-flex>
		`
	}
}

customElements.define('mo-story-popover-lazy', StoryPopoverLazy)

/* eslint-disable @html-eslint/use-baseline */

export const PlatformInvokers: StoryObj = {
	render: ({ placement, alignment }) => {
		const commandsSupported = 'commandForElement' in HTMLButtonElement.prototype
		return html`
			<mo-flex gap='1rem' alignItems='start'>
				<mo-card>
					A popover is a native popover element, which is why the platform's own invoker buttons
					drive it without any wiring by this library: they toggle it, tether it as their implicit
					anchor and wire up the corresponding ARIA attributes and focus behavior themselves.
				</mo-card>

				<button popovertarget='story-popover-popovertarget'>
					Toggle via "popovertarget"
				</button>
				<mo-popover id='story-popover-popovertarget' placement=${placement} alignment=${alignment}>
					<mo-card heading='popovertarget'>
						Opened by the browser. No anchor was assigned to this popover.
					</mo-card>
				</mo-popover>

				${!commandsSupported ? html`
					<mo-card heading='commandfor'>
						The Invoker Commands API is not supported in this browser.
					</mo-card>
				` : html`
					<button commandfor='story-popover-commandfor' command='toggle-popover'>
						Toggle via "commandfor"
					</button>
					<mo-popover id='story-popover-commandfor' placement=${placement} alignment=${alignment}>
						<mo-card heading='commandfor'>
							Opened by the browser. No anchor was assigned to this popover.
						</mo-card>
					</mo-popover>
				`}
			</mo-flex>
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
			mo-button {
				anchor-name: --story-popover-catalog;
				width: 600px;
				height: 200px;
			}

			mo-popover {
				position-anchor: --story-popover-catalog;
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