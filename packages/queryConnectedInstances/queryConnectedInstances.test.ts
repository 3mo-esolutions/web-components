import { Component } from '@a11d/lit'
import { queryConnectedInstances } from './queryConnectedInstances.js'

class QueryConnectedInstancesTestComponent extends Component {
	@queryConnectedInstances() static readonly connectedInstances: Set<QueryConnectedInstancesTestComponent>
}

customElements.define('query-connected-instances-test-component', QueryConnectedInstancesTestComponent)

describe('queryConnectedInstances', () => {
	it('should create a getter that returns the same instance of a Set ', () => {
		expect(QueryConnectedInstancesTestComponent.connectedInstances).toBeInstanceOf(Set)
		expect(QueryConnectedInstancesTestComponent.connectedInstances).toBe(QueryConnectedInstancesTestComponent.connectedInstances)
	})

	it('should add the instance to the Set when connected', () => {
		const instance = new QueryConnectedInstancesTestComponent()
		expect(QueryConnectedInstancesTestComponent.connectedInstances).not.toContain(instance)
		document.body.append(instance)
		expect(QueryConnectedInstancesTestComponent.connectedInstances).toContain(instance)
		instance.remove()
		expect(QueryConnectedInstancesTestComponent.connectedInstances).not.toContain(instance)
		document.body.append(instance)
		expect(QueryConnectedInstancesTestComponent.connectedInstances).toContain(instance)
		instance.remove()
		expect(QueryConnectedInstancesTestComponent.connectedInstances).not.toContain(instance)
	})
})