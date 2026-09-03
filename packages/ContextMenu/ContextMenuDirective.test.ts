import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { contextMenu } from './index.js'

describe('ContextMenuDirective', () => {
	const fixture = new ComponentTestFixture<HTMLDivElement>(html`
		<div ${contextMenu(() => html`<mo-context-menu-item>Item</mo-context-menu-item>`)}>Target</div>
	`)

	it('should wrap template inside mo-context-menu popover', () => {
		expect(fixture.component).toBeDefined()
	})
})