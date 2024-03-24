import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Expander',
	component: 'mo-expander',
	package: p,
} as Meta

export const Expander: StoryObj = {
	render: () => html`
		<mo-expander heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
}

export const SlotHeading: StoryObj = {
	render: () => html`
		<mo-expander>
			<mo-flex slot='heading' direction='horizontal' alignItems='center' gap='10px' style='color: chartreuse'>
				<mo-icon icon='new_releases'></mo-icon>
				<mo-heading typography='heading3'>Very Important Heading</mo-heading>
			</mo-flex>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
}

export const PartHeader: StoryObj = {
	render: () => html`
		<style>
			#part-header::part(header) {
				color: chartreuse;
			}
		</style>
		<mo-expander id='part-header' heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
}

export const PartHeading: StoryObj = {
	render: () => html`
		<style>
			#part-heading::part(heading) {
				color: chartreuse;
			}
		</style>
		<mo-expander id='part-heading' heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
}

export const PartExpandCollapseIconButton: StoryObj = {
	render: () => html`
		<style>
			#part-expand-collapse-icon-button::part(expand-collapse-icon-button) {
				color: chartreuse;
			}
		</style>
		<mo-expander id='part-expand-collapse-icon-button' heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
}