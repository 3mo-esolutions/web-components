import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Color } from '@3mo/color'
import './index.js'

export default {
	title: 'Inputs / Color Picker',
	component: 'mo-color-picker',
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	render: () => html`<mo-color-picker></mo-color-picker>`,
}

/** The value is a `Color`. `input` follows the picker while it is open, `change` reports the color it closes with. */
export const Value: Story = {
	render: () => html`<mo-color-picker .value=${new Color('#3f51b5')}></mo-color-picker>`,
}

/** `presets` offers a list of colors in the browser's picker, in browsers that support it. */
export const Presets: Story = {
	render: () => html`<mo-color-picker presets='["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"]'></mo-color-picker>`,
}
