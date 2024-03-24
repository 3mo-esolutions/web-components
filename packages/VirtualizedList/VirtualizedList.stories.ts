import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Virtualized List',
	component: 'mo-virtualized-list',
	package: p,
} as Meta

const items = new Array(1000).fill(undefined).map((_, i) => i)

const selectedItems = new Set<number>()

export const Virtualized: StoryObj = {
	render: () => html`
		<mo-virtualized-list style='height: 500px' .data=${items} .getItemTemplate=${(i: number) => html`
			<mo-selectable-list-item
				?selected=${selectedItems.has(i)}
				@change=${(e: CustomEvent<boolean>) => e.detail ? selectedItems.add(i) : selectedItems.delete(i)}
			>Item ${i}</mo-selectable-list-item>
		`}></mo-virtualized-list>
	`
}