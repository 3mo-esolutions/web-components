// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ComponentTestFixture<TComponent extends import('@a11d/lit').LitElement> {
	private _component?: TComponent
	get component() { return this._component! }

	constructor(private readonly constructComponent: () => TComponent) {
		beforeEach(() => this.initialize())
		afterEach(() => this._component?.remove())
	}

	async initialize() {
		this._component?.remove()
		this._component = this.constructComponent()
		document.body.appendChild(this._component)
		await this._component.updateComplete
		return this._component
	}

	get updateComplete() {
		return this._component?.updateComplete
	}

	requestUpdate() {
		this._component?.requestUpdate()
	}

	async update() {
		this.requestUpdate()
		await this.updateComplete
	}
}

// @ts-expect-error - ComponentTestFixture global value
globalThis.ComponentTestFixture = ComponentTestFixture