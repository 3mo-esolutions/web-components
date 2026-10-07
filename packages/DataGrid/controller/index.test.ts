import './index.js'

describe('DataGrid controller entry', () => {
	// Each spec file loads in a page of its own, so what this import registers is all that is registered.
	it('should stand alone: a host of its own design takes the controller without the data grid elements', () => {
		expect(customElements.get('mo-data-grid')).toBeUndefined()
		expect(customElements.get('mo-data-grid-column')).toBeUndefined()
		expect(customElements.get('mo-data-grid-row')).toBeUndefined()
		expect(customElements.get('mo-data-grid-cell')).toBeUndefined()
	})
})
