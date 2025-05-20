import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Selection & Input / Color Picker',
	component: 'mo-color-picker',
	package: p,
} as Meta

export const Default: StoryObj = {
	render: () => {
		return html`<mo-color-picker></mo-color-picker>`
	}
}

export const WithPresets: StoryObj = {
	render: () => {
		return html`
			<mo-color-picker
				presets='["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"]'
			></mo-color-picker>
		`
	}
}