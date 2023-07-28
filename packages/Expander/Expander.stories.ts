import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Expander',
	component: 'mo-expander',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Expander = story({
	render: () => html`
		<mo-expander heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
})

export const SlotHeading = story({
	render: () => html`
		<mo-expander>
			<mo-flex slot='heading' direction='horizontal' alignItems='center' gap='10px' style='color: chartreuse'>
				<mo-icon icon='new_releases'></mo-icon>
				<mo-heading typography='heading3'>Very Important Heading</mo-heading>
			</mo-flex>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
})

export const PartHeader = story({
	render: () => html`
		<style>
			mo-expander::part(header) {
				color: chartreuse;
			}
		</style>
		<mo-expander heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
})

export const PartHeading = story({
	render: () => html`
		<style>
			mo-expander::part(heading) {
				color: chartreuse;
			}
		</style>
		<mo-expander heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
})

export const PartExpandCollapseIconButton = story({
	render: () => html`
		<style>
			mo-expander::part(expand-collapse-icon-button) {
				color: chartreuse;
			}
		</style>
		<mo-expander heading='Heading'>
			Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quasi totam rerum sunt! Aliquam tempore dolore rem est quos at officiis, distinctio dolor atque laborum, eveniet incidunt! Repellat ab atque hic.
		</mo-expander>
	`
})