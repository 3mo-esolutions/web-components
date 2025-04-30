import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import { SelectableListSelectability } from './index.js'

export default {
	title: 'Selectable List',
	component: 'mo-selectable-list',
	package: p,
} as Meta

const getTemplate = (selectability: SelectableListSelectability) => html`
	Check the console for the selected item.
	<mo-selectable-list selectability=${selectability}>
		<mo-selectable-list-item toggleable>Item 1</mo-selectable-list-item>
		<mo-selectable-list-item toggleable>Item 2</mo-selectable-list-item>
		<mo-checkbox-list-item disabled>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 4</mo-checkbox-list-item>
		<mo-switch-list-item>Item 5</mo-switch-list-item>
		<mo-switch-list-item>Item 6</mo-switch-list-item>
		<mo-radio-list-item>Item 7</mo-radio-list-item>
		<mo-radio-list-item>Item 8</mo-radio-list-item>
	</mo-selectable-list>
`

export const Single: StoryObj = {
	render: () => getTemplate(SelectableListSelectability.Single)
}

export const Multiple: StoryObj = {
	render: () => getTemplate(SelectableListSelectability.Multiple)
}