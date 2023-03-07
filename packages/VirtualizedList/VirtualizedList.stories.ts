import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default meta({
	title: 'Core/List/Virtualized',
	component: 'mo-virtualized-list',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
})

const items = new Array(1000).fill(undefined).map((_, i) => i)

const selectedItems = new Set<number>()

export const Virtualized = story({
	render: () => html`
		<mo-virtualized-list style='height: 500px' .data=${items} .getItemTemplate=${(i: number) => html`
			<mo-selectable-list-item
				?selected=${selectedItems.has(i)}
				@change=${(e: CustomEvent<boolean>) => e.detail ? selectedItems.add(i) : selectedItems.delete(i)}
			>Item ${i}</mo-selectable-list-item>
		`}></mo-virtualized-list>
	`
})