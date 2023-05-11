import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'ColorPicker',
	component: 'mo-color-picker',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Default = story({
	render: () => {
		return html`<mo-color-picker></mo-color-picker>`
	}
})

export const WithPresets = story({
	render: () => {
		return html`
			<mo-color-picker
				presets='["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"]'
			></mo-color-picker>
		`
	}
})