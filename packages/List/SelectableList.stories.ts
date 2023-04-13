import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { SelectableListSelectionMode } from './index.js'

export default meta({
	title: 'Core/List/Selectable',
	component: 'mo-selectable-list',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	},
})

const getTemplate = (selectionMode: SelectableListSelectionMode) => html`
	Check the console for the selected item.
	<mo-selectable-list selectionMode=${selectionMode}>
		<mo-selectable-list-item>Item 1</mo-selectable-list-item>
		<mo-selectable-list-item>Item 2</mo-selectable-list-item>
		<mo-checkbox-list-item disabled>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 3</mo-checkbox-list-item>
		<mo-checkbox-list-item>Item 4</mo-checkbox-list-item>
		<mo-switch-list-item>Item 5</mo-switch-list-item>
		<mo-switch-list-item>Item 6</mo-switch-list-item>
		<mo-radio-list-item>Item 7</mo-radio-list-item>
		<mo-radio-list-item>Item 8</mo-radio-list-item>
	</mo-selectable-list>
`

export const Single = story({
	render: () => getTemplate(SelectableListSelectionMode.Single)
})

export const Multiple = story({
	render: () => getTemplate(SelectableListSelectionMode.Multiple)
})