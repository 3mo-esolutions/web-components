import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { type Color } from '@3mo/color'
import '@3mo/color-field'
import '@3mo/flex'
import '@3mo/grid'
import p from './package.json'
import '.'

export default {
	title: 'Theme',
	package: p,
} as Meta

export const Colors: StoryObj = {
	render: () => {
		return html`
			<style>
				mo-grid {
					padding: 10px;
					gap: 1rem;
					mo-flex {
						gap: 1rem;
					}
					div {
						display: flex;
						width: 100px;
						height: 100px;
						padding: 6px;
						align-items: center;
						justify-content: center;
						box-sizing: border-box;
						text-align: center;
					}
				}

				mo-collapsible-card div {
					margin-top: 1rem;
					padding: 1rem;
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
					<mo-flex direction='horizontal'>
						<div style='background: var(--mo-color-accent); color: var(--mo-color-on-accent)'>Accent / On Accent</div>
						<div style='background: var(--mo-color-red)'>Red</div>
						<div style='background: var(--mo-color-green)'>Green</div>
						<div style='background: var(--mo-color-yellow)'>Yellow</div>
						<div style='background: var(--mo-color-blue)'>Blue</div>
						<div style='background: var(--mo-color-gray); color: black;'>Gray</div>
						<div style='background: var(--mo-color-gray-transparent)'>Gray Transparent</div>
					</mo-flex>
					<mo-flex direction='horizontal'>
						<div style='background: var(--mo-color-background); color: var(--mo-color-foreground)'>Background / Foreground</div>
						<div style='background: var(--mo-color-surface-container-lowest); color: var(--mo-color-on-surface)'>Surface Container Lowest</div>
						<div style='background: var(--mo-color-surface-container-low); color: var(--mo-color-on-surface)'>Surface Container Low</div>
						<div style='background: var(--mo-color-surface-container); color: var(--mo-color-on-surface)'>Surface Container i.e. Surface</div>
						<div style='background: var(--mo-color-surface-container-high); color: var(--mo-color-on-surface)'>Surface Container High</div>
						<div style='background: var(--mo-color-surface-container-highest); color: var(--mo-color-on-surface)'>Surface Container Highest</div>
					</mo-flex>
				</mo-grid>

				<mo-collapsible-card type='outlined' heading='Nested Surface Container Colors' open>
					<div style='background: var(--mo-color-surface-container-lowest)'>
						Lowest
						<div style='background: var(--mo-color-surface-container-low)'>
							Low
							<div style='background: var(--mo-color-surface-container)'>
								Surface
								<div style='background: var(--mo-color-surface-container-high)'>
									High
									<div style='background: var(--mo-color-surface-container-highest)'>
										Highest
									</div>
								</div>
							</div>
						</div>
					</div>
				</mo-collapsible-card>
			</mo-flex>
		`
	}
}