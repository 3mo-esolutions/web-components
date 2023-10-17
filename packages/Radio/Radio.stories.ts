import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Radio',
	component: 'mo-radio',
	args: {
		disabled: false,
		label: 'Label',
		selected: false,
	},
	argTypes: {
		disabled: { control: 'boolean' },
		label: { control: 'text' },
		selected: { control: 'boolean' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Radio = story({
	render: ({ label, disabled, selected }) => html`
		<mo-radio
			label=${label}
			?disabled=${disabled}
			?selected=${selected}
		></mo-radio>
	`
})

export const RadioGroup = story({
	render: ({ label, disabled }) => html`
		Group One:
		<mo-flex direction='horizontal'>
			<mo-radio name='group-one' label=${label} ?disabled=${disabled}></mo-radio>
			<mo-radio name='group-one' label=${label} ?disabled=${disabled}></mo-radio>
		</mo-flex>
		Group Two:
		<mo-flex direction='horizontal'>
			<mo-radio name='group-two' label=${label} ?disabled=${disabled}></mo-radio>
			<mo-radio name='group-two' label=${label} ?disabled=${disabled}></mo-radio>
		</mo-flex>
	`
})