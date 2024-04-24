import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Splitter',
	component: 'mo-splitter',
	args: {
		gap: '0px',
	},
	argTypes: {
		gap: { control: 'text' },
	},
	package: p,
} as Meta

export const Splitter: StoryObj = {
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
}

export const SplitterWithCustomResizer: StoryObj = {
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
}

export const Complex: StoryObj = {
	render: ({ gap }) => html`
		<mo-splitter direction='horizontal' gap=${gap} ${style({ height: '500px' })}>
			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(0, 128, 128, 0.3)' })}>Item 1</div>
			</mo-splitter-item>

			<mo-splitter-item min='20%' max='80%'>
				<div ${style({ background: 'rgba(255, 192, 203, 0.3)' })}>Item 2</div>
			</mo-splitter-item>

			<mo-splitter-item min='20%' max='80%'>
				<mo-splitter direction='vertical' gap=${gap} ${style({ height: '500px' })}>
					<mo-splitter-item min='20%' max='80%'>
						<div ${style({ background: 'rgba(0, 128, 128, 0.3)' })}>Item 3</div>
					</mo-splitter-item>

					<mo-splitter-item min='20%' max='80%'>
						<div ${style({ background: 'rgba(255, 192, 203, 0.3)' })}>Item 4</div>
					</mo-splitter-item>
				</mo-splitter>
			</mo-splitter-item>
		</mo-splitter>
	`
}