import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { Color } from '@3mo/color'
import { Theme } from './index.js'

const swatches = (title: string, background: string, content: unknown) => html`
	<div style='display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; padding: 10px; border: 1px solid var(--mo-color-transparent-gray-3); background: ${background}'>
		<span style='grid-column: 1 / -1'>${title}</span>
		${content}
	</div>
`

export default {
	title: 'Foundations / Theme',
	decorators: [story => html`
		<style>
			.swatch {
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100px;
				padding: 6px;
				box-sizing: border-box;
				text-align: center;
				border-radius: var(--mo-border-radius);
			}
		</style>
		<div style='display: flex; flex-direction: column; gap: 10px'>
			<mo-field-color label='Accent' style='max-width: 360px'
				.value=${Theme.accent.toColor()}
				@change=${(event: CustomEvent<Color>) => Theme.accent.value = event.detail.rgb}
			>
				<mo-icon-button slot='end' icon='restart_alt' @click=${() => Theme.accent.value = undefined}></mo-icon-button>
			</mo-field-color>
			${swatches('Background', 'var(--mo-color-background)', story())}
			${swatches('Surface', 'var(--mo-color-surface)', story())}
		</div>
	`],
} satisfies Meta

/** Every palette color on the background and on a surface: pick an accent to see what derives from it, or switch the theme in the toolbar. */
export const Colors: StoryObj = {
	render: () => html`
		<div class='swatch' style='background: var(--mo-color-background); color: var(--mo-color-foreground)'>Background / Foreground</div>
		<div class='swatch' style='background: var(--mo-color-surface); color: var(--mo-color-on-surface)'>Surface</div>
		<div class='swatch' style='background: var(--mo-color-surface-container-lowest); color: var(--mo-color-on-surface)'>Surface Container Lowest</div>
		<div class='swatch' style='background: var(--mo-color-surface-container-low); color: var(--mo-color-on-surface)'>Surface Container Low</div>
		<div class='swatch' style='background: var(--mo-color-surface-container); color: var(--mo-color-on-surface)'>Surface Container</div>
		<div class='swatch' style='background: var(--mo-color-surface-container-high); color: var(--mo-color-on-surface)'>Surface Container High</div>
		<div class='swatch' style='background: var(--mo-color-surface-container-highest); color: var(--mo-color-on-surface)'>Surface Container Highest</div>
		<div class='swatch' style='background: var(--mo-color-red)'>Red</div>
		<div class='swatch' style='background: var(--mo-color-green)'>Green</div>
		<div class='swatch' style='background: var(--mo-color-yellow)'>Yellow</div>
		<div class='swatch' style='background: var(--mo-color-blue)'>Blue</div>
		<div class='swatch' style='background: var(--mo-color-gray); color: black'>Gray</div>
		<div class='swatch' style='background: var(--mo-color-gray-transparent)'>Gray Transparent</div>
		<div class='swatch' style='background: var(--mo-color-transparent-gray-3)'>Transparent Gray</div>
		<div class='swatch' style='background: var(--mo-color-accent); color: var(--mo-color-on-accent)'>Accent / On Accent</div>
		<div class='swatch' style='background: var(--mo-color-accent-container); color: var(--mo-color-on-accent-container)'>Accent Container / On Accent Container</div>
	`,
}
