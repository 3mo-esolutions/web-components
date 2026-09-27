import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import swatchSource from './stories/Swatch.ts?raw'
import './stories/Swatch.js'

export default {
	title: 'Utilities / Style Property',
	decorators: [story => html`<mo-flex direction='horizontal' gap='8px' alignItems='center'>${story()}</mo-flex>`],
} satisfies Meta

/** Setting the property, here through its attribute, writes the custom property `--story-swatch-color` into the host's inline style. */
export const Default: StoryObj = {
	parameters: sourceOf(swatchSource),
	render: () => html`<story-swatch color='tomato'></story-swatch>`,
}

/** A `styleConverter` translates between the property and the style, here a number of pixels into `inline-size`. */
export const Converter: StoryObj = {
	render: () => html`
		<story-swatch size='24'></story-swatch>
		<story-swatch size='48' color='seagreen'></story-swatch>
		<story-swatch size='96' color='steelblue'></story-swatch>
	`,
}