import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { thousandPeople, type Person } from '../../stories/index.js'
import './index.js'

export default {
	title: 'Data / Virtualized List',
	component: 'mo-virtualized-list',
} satisfies Meta

export const Default: StoryObj = {
	render: () => html`
		<mo-virtualized-list style='height: 500px'
			.data=${Array.from({ length: 1000 }, (_, index) => `Item ${index + 1}`)}
			.getItemTemplate=${(item: string) => html`<mo-list-item>${item}</mo-list-item>`}
		></mo-virtualized-list>
	`,
}

/** Only the items near the viewport are rendered, and they are recycled as it scrolls, so state such as the selection lives outside them - select a few, scroll away and back. */
export const Selection: StoryObj = {
	render: () => {
		const [selection, setSelection] = useState(new Array<number>())
		return html`
			<mo-virtualized-list style='height: 500px'
				.data=${thousandPeople}
				.getItemTemplate=${(person: Person) => html`
					<mo-selectable-list-item toggleable ?selected=${selection.includes(person.id)}
						@change=${(event: CustomEvent<boolean>) => setSelection(event.detail ? [...selection, person.id] : selection.filter(id => id !== person.id))}
					>${person.name}</mo-selectable-list-item>
				`}
			></mo-virtualized-list>
		`
	},
}