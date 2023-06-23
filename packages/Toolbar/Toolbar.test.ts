/*import { html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit/dist/test'
import { Toolbar } from './index.js'

describe('Toolbar', () => {
	const fixture = new ComponentTestFixture<Toolbar>(html`
		<mo-toolbar>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
			<mo-menu-item icon='content_copy'>
				<span>Copy</span>
			</mo-menu-item>
		</mo-toolbar>
	`)

	it('should render all items if given enough space', async () => {
		fixture.component.style.width = '800px'

		await fixture.updateComplete
		expect([...fixture.component.querySelectorAll('mo-menu-item')].every(item => item.slot === '')).toBe(true)
	})

	it('should fold items')
})*/