import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type ToolbarPane } from './ToolbarPane.js'

describe('ToolbarPane', () => {
	const fixture = new ComponentTestFixture<ToolbarPane>(html`
		<mo-toolbar-pane>
			<button>Item 1</button>
			<button>Item 2</button>
		</mo-toolbar-pane>
	`)

	it('should track slotted items', () => {
		expect(fixture.component.items.length).toBe(2)
	})
})