import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { tooltip } from './index.js'

export default meta({
	title: 'Tooltip',
	component: 'mo-tooltip',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Tooltip = story({
	render: () => html`
		<h3>Hover or focus on the following elements to see their tooltip</h3>
		<mo-icon-button icon='skip_previous' ${tooltip('Previous')}></mo-icon-button>
		<mo-icon-button icon='fast_rewind' ${tooltip('Rewind')}></mo-icon-button>
		<mo-icon-button icon='play_arrow' ${tooltip('Play')}></mo-icon-button>
		<mo-icon-button icon='fast_forward' ${tooltip('Forward')}></mo-icon-button>
		<mo-icon-button icon='skip_next' ${tooltip('Next')}></mo-icon-button>
	`
})

export const Rich = story({
	render: () => html`
		<h3>Hover or focus on the following elements to see their tooltip</h3>
		<mo-icon-button icon='help'
			${tooltip(html`
				<mo-heading typography='heading4'>Help</mo-heading>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl nec
				ultricies lacinia, nunc nisl tincidunt nunc, eget aliquam massa nisl eget
				lectus. Nullam auctor, nisl eget aliquam tincidunt, nisl nisl aliquam
			`)}
		></mo-icon-button>
	`
})