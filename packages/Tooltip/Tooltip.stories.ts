import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import p from './package.json'
import { tooltip } from './index.js'

export default {
	title: 'Communication / Tooltip',
	component: 'mo-tooltip',
	package: p,
} as Meta

export const Tooltip: StoryObj = {
	render: () => html`
		<h3>Hover or focus on the following elements to see their tooltip</h3>
		<mo-icon-button icon='skip_previous' ${tooltip('Previous')}></mo-icon-button>
		<mo-icon-button icon='fast_rewind' ${tooltip('Rewind')}></mo-icon-button>
		<mo-icon-button icon='play_arrow' ${tooltip('Play')}></mo-icon-button>
		<mo-icon-button icon='fast_forward' ${tooltip('Forward')}></mo-icon-button>
		<mo-icon-button icon='skip_next' ${tooltip('Next')}></mo-icon-button>
	`
}

/* eslint-disable @html-eslint/use-baseline */

export const PlatformInterest: StoryObj = {
	render: () => {
		const supported = 'interestForElement' in HTMLButtonElement.prototype
		return html`
			<mo-flex gap='1rem' alignItems='start'>
				<mo-card>
					A tooltip tracks interest in its anchor itself, but also honors the interest events of a
					native <code>interestfor</code> invoker, leaving the gesture and timing semantics —
					including the <code>interest-delay</code> CSS properties, hover persistence and the
					touch and keyboard affordances — to the platform where it supports them.
					${!supported ? html`<br><br><strong>Interest invokers are not supported in this browser.</strong>` : ''}
				</mo-card>

				<button interestfor='story-tooltip-interest' style='interest-delay: 0.3s 0.2s'>
					Hover or focus me
				</button>
				<mo-tooltip id='story-tooltip-interest'>Shown by the browser</mo-tooltip>
			</mo-flex>
		`
	}
}

export const Rich: StoryObj = {
	render: () => html`
		<h3>Hover or focus on the following elements to see their tooltip</h3>
		<mo-icon-button icon='help'
			${tooltip(() => html`
				<mo-heading typography='heading4'>Help</mo-heading>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec
				ultricies lacinia, nunc nisl tincidunt nunc, eget aliquam massa nisl eget
				lectus. Nullam auctor, nisl eget aliquam tincidunt, nisl nisl aliquam
			`)}
		></mo-icon-button>
	`
}