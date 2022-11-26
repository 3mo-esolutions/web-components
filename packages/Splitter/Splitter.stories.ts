import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/Layout/Splitter',
	component: 'mo-splitter',
	args: {
		gap: '0px',
	},
	argTypes: {
		gap: { control: 'text' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Splitter = story({
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} ${style({ height: '500px' })}>
			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(0, 128, 128, 0.3)' })}>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(255, 192, 203, 0.3)' })}>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`
})

export const SplitterWithCustomResizer = story({
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} ${style({ height: '500px' })}
			.resizerTemplate=${html`<mo-splitter-resizer-line></mo-splitter-resizer-line>`}
		>
			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(0, 128, 128, 0.3)' })}>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(255, 192, 203, 0.3)' })}>Item 2</div>
			</mo-splitter-item>
		</mo-splitter>
	`
})