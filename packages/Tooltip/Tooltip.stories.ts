import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { tooltip, TooltipPlacement } from './index.js'

export default {
	title: 'Feedback / Tooltip',
	component: 'mo-tooltip',
	decorators: [story => html`<div style='display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 48px'>${story()}</div>`],
} satisfies Meta

/** Hover or focus a button: the `tooltip` directive attaches a tooltip, and its text also labels the button. */
export const Default: StoryObj = {
	render: () => html`
		<mo-icon-button icon='skip_previous' ${tooltip('Previous')}></mo-icon-button>
		<mo-icon-button icon='fast_rewind' ${tooltip('Rewind')}></mo-icon-button>
		<mo-icon-button icon='play_arrow' ${tooltip('Play')}></mo-icon-button>
		<mo-icon-button icon='fast_forward' ${tooltip('Forward')}></mo-icon-button>
		<mo-icon-button icon='skip_next' ${tooltip('Next')}></mo-icon-button>
	`,
}

/** The second argument picks the side of the anchor; the sides are logical, so pick a right-to-left language in the toolbar to see inline start and end swap. */
export const Placement: StoryObj = {
	render: () => html`
		<mo-button ${tooltip('Above', TooltipPlacement.BlockStart)}>Block start</mo-button>
		<mo-button ${tooltip('Below', TooltipPlacement.BlockEnd)}>Block end</mo-button>
		<mo-button ${tooltip('Before', TooltipPlacement.InlineStart)}>Inline start</mo-button>
		<mo-button ${tooltip('After', TooltipPlacement.InlineEnd)}>Inline end</mo-button>
	`,
}

/** A template in place of the text makes a rich tooltip, drawn on a surface rather than in the text color. */
export const Rich: StoryObj = {
	render: () => html`
		<mo-icon-button icon='help' ${tooltip(() => html`
			<mo-heading typography='heading4'>Payment terms</mo-heading>
			<div style='max-width: 280px'>Invoices are due 14 days after they are sent. Late payments are reminded after 7 more days, then once a week.</div>
		`)}></mo-icon-button>
	`,
}

/* eslint-disable @html-eslint/use-baseline */

/** A native `interestfor` invoker can show a `mo-tooltip` by its id, leaving the timing - including `interest-delay` - to the browser. Needs a browser with interest invokers. */
export const InterestFor: StoryObj = {
	render: () => html`
		<button interestfor='tooltip-interest' style='interest-delay: 0.3s 0.2s'>Hover or focus me</button>
		<mo-tooltip id='tooltip-interest'>Shown by the browser</mo-tooltip>
	`,
}
