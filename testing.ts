class ComponentTestFixture<TComponent extends import('@a11d/lit').LitElement> {
	private _component!: TComponent
	get component() { return this._component }

	constructor(constructComponent: () => TComponent) {
		beforeEach(async () => {
			this._component = constructComponent()
			document.body.appendChild(this.component)
			await this.component.updateComplete
			return this.component
		})

		afterEach(() => this.component.remove())
	}
}

function setupFixture<TComponent extends import('@a11d/lit').LitElement>(constructComponent: () => TComponent) {
	return new ComponentTestFixture(constructComponent)
}

globalThis.setupFixture = setupFixture