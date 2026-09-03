import { ComponentTestFixture } from '@a11d/lit-testing'
import { RoutableComponent } from '@a11d/lit-application'
import { ApplicationLogo } from './ApplicationLogo.js'

const source = '<svg id="test-application-logo" viewBox="0 0 10 10"><rect width="10" height="10"></rect></svg>'

describe('ApplicationLogo', () => {
	const fixture = new ComponentTestFixture<ApplicationLogo>('mo-application-logo')

	let sourceBeforeTest: string | undefined
	beforeEach(() => sourceBeforeTest = ApplicationLogo.source)
	afterEach(() => ApplicationLogo.source = sourceBeforeTest)

	it('should render the SVG markup of its source', async () => {
		fixture.component.source = source

		await fixture.updateComplete

		expect(fixture.component.renderRoot.querySelector('svg#test-application-logo')).not.toBeNull()
	})

	it('should default its source to the statically configured ApplicationLogo.source', () => {
		ApplicationLogo.source = source

		expect(new ApplicationLogo().source).toBe(source)
	})

	it('should navigate to the application\'s base path when clicked', () => {
		const setUrl = spyOn(RoutableComponent, 'setUrl')
		const expected = new URL(`/${RoutableComponent.basePath}`, RoutableComponent.url).toString()

		fixture.component.click()

		expect(setUrl).toHaveBeenCalledTimes(1)
		expect(setUrl.calls.mostRecent().args[0]?.toString()).toBe(expected)
	})
})