import { component, html } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { EntityDialogComponent } from './index.js'

class Entity { }
const entity = new Entity
const fetchSpy = jasmine.createSpy().and.returnValue(Promise.resolve(entity))
const saveSpy = jasmine.createSpy()
const deleteSpy = jasmine.createSpy()

@component('mo-dialog-entity-test')
class DialogTest extends EntityDialogComponent<Entity> {
	protected entity = entity
	protected fetch = fetchSpy
	protected save = saveSpy
	protected delete = deleteSpy

	protected override get template() {
		return html`
			<mo-entity-dialog></mo-entity-dialog>
		`
	}
}

describe('EntityDialogComponent', () => {
	let entityId: number | undefined
	const fixture = new ComponentTestFixture(() => new DialogTest({ id: entityId }))

	beforeEach(() => {
		deleteSpy.calls.reset()
		fetchSpy.calls.reset()
		saveSpy.calls.reset()
	})

	describe('in creation mode', () => {
		beforeAll(() => entityId = undefined)

		it('should not try to fetch entity when no id is passed in parameters', () => {
			expect(fetchSpy).not.toHaveBeenCalled()
		})

		it('should not delete entity when secondary-button is clicked', () => {
			fixture.component.secondaryActionElement?.click()
			expect(deleteSpy).not.toHaveBeenCalled()
		})
	})

	describe('in edit mode', () => {
		beforeAll(() => entityId = 10)

		it('should save entity when primary-button is clicked', () => {
			fixture.component.primaryActionElement?.click()
			expect(saveSpy).toHaveBeenCalledOnceWith(entity)
		})

		it('should delete entity when secondary-button is clicked', () => {
			fixture.component.secondaryActionElement?.click()
			expect(deleteSpy).toHaveBeenCalledWith(entity)
		})
	})
})