import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { Color } from './index.js'

export default {
	title: 'Utilities / Color',
} satisfies Meta

export const Default: StoryObj = {
	render: () => {
		const color = new Color('tomato')
		return html`
			<mo-flex direction='horizontal' gap='16px' alignItems='center'>
				<div style='inline-size: 64px; block-size: 64px; border-radius: var(--mo-border-radius); background: ${color}'></div>
				<mo-flex gap='4px'>
					<code>${color.hex}</code>
					<code>${color.rgb}</code>
					<code>${color.hsl}</code>
					<code>${color.keyword}</code>
				</mo-flex>
			</mo-flex>
		`
	},
}

/** Any CSS color string parses: hex with or without alpha, `rgb()`, `hsl()` and keywords. `r`, `g`, `b` and `a` are its channels. */
export const Parsing: StoryObj = {
	render: () => html`
		<table style='border-spacing: 16px 4px'>
			${['#1e90ff', '#1e90ff80', 'rgb(46, 204, 113)', 'hsl(45, 100%, 50%)', 'rebeccapurple'].map(text => [text, new Color(text)] as const).map(([text, color]) => html`
				<tr>
					<td><code>${text}</code></td>
					<td>
						<div style='inline-size: 24px; block-size: 24px; border-radius: 4px; background: ${color.rgb}'></div>
					</td>
					<td><code>${color.hex}</code></td>
					<td>${color.r}, ${color.g}, ${color.b}, ${color.a}</td>
				</tr>
			`)}
		</table>
	`,
}
