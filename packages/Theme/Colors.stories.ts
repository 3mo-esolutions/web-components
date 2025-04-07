import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import { type Color } from '@3mo/color'
import p from './package.json'
import '.'

export default {
	title: 'Theme',
	package: p,
} as Meta

export const Colors: StoryObj = {
	render: () => {
		const colors = html`
			<div style='background: var(--mo-color-background); color: var(--mo-color-foreground)'>Background / Foreground</div>
			<div style='background: var(--mo-color-surface); color: var(--mo-color-on-surface)'>Surface</div>
			<div style='background: var(--mo-color-surface-container-lowest); color: var(--mo-color-on-surface)'>Surface Container Lowest</div>
			<div style='background: var(--mo-color-surface-container-low); color: var(--mo-color-on-surface)'>Surface Container Low</div>
			<div style='background: var(--mo-color-surface-container); color: var(--mo-color-on-surface)'>Surface Container</div>
			<div style='background: var(--mo-color-surface-container-high); color: var(--mo-color-on-surface)'>Surface Container High</div>
			<div style='background: var(--mo-color-surface-container-highest); color: var(--mo-color-on-surface)'>Surface Container Highest</div>
			<div style='background: var(--mo-color-red)'>Red</div>
			<div style='background: var(--mo-color-green)'>Green</div>
			<div style='background: var(--mo-color-yellow)'>Yellow</div>
			<div style='background: var(--mo-color-blue)'>Blue</div>
			<div style='background: var(--mo-color-gray); color: black;'>Gray</div>
			<div style='background: var(--mo-color-gray-transparent)'>Gray Transparent</div>
			<div style='background: var(--mo-color-accent); color: var(--mo-color-on-accent)'>Accent / On Accent</div>
		`
		return html`
			<style>
				mo-grid div {
					display: flex;
					align-items: center;
					justify-content: center;
					width: min-content;
					min-width: 100px;
					height: 100px;
					padding: 6px;
					box-sizing: border-box;
					text-align: center;
					border-radius: var(--mo-border-radius);
				}

				mo-grid {
					padding: 10px;
					gap: 10px;
					grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
					border: 1px solid var(--mo-color-transparent-gray-3);
				}

				mo-grid span {
					grid-column: 1 / -1;
				}
			</style>
			<mo-flex gap='10px'>
				<mo-field-color label='Accent'
					.value=${Theme.accent.toColor()}
					@change=${(e: CustomEvent<Color>) => Theme.accent.value = e.detail.rgb}
				>
					<mo-icon-button slot='end' icon='restart_alt' @click=${() => Theme.accent.value = undefined}></mo-icon-button>
				</mo-field-color>

				<mo-grid>
					<span>Background</span>
					${colors}
				</mo-grid>
				<mo-grid style='background: var(--mo-color-surface)'>
					<span>Surface</span>
					${colors}
				</mo-grid>
			</mo-flex>
		`
	}
}