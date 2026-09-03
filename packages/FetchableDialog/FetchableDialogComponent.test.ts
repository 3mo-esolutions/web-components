import { component, html } from '@a11d/lit'
import { DialogComponent } from '@a11d/lit-application'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { type EntityId, FetchableDialogComponent } from './FetchableDialogComponent.js'
import './index.js'

type Item = { id: number, name: string }

const preset = () => ({ id: 0, name: 'Preset' })
const fetchSpy = jasmine.createSpy('fetch').and.callFake((id: EntityId) => ({ id: Number(id), name: `Item ${id}` }) as Item)

@component('mo-fetchable-dialog-component-test')
class DialogTest extends FetchableDialogComponent<Item> {
	protected entity = preset()
	protected override fetch = fetchSpy

	protected override get template() {
		return html`
			<mo-fetchable-dialog>
				<div id='name'>${this.entity.name}</div>
				<input id='name-field' ${this.entityBinder.bind('name')}>
			</mo-fetchable-dialog>
		`
	}
}

@component('mo-fetchable-dialog-component-without-dialog-test')
class DialogWithoutFetchableDialogTest extends FetchableDialogComponent<Item> {
	protected entity = preset()
	protected override fetch = fetchSpy

	protected override get template() {
		return html`<mo-dialog></mo-dialog>`
	}

	override connectedCallback() {
		return DialogComponent.prototype.connectedCallback.call(this)
	}

	protected override firstUpdated() { }
}

describe('FetchableDialogComponent', () => {
	const waitUntil = async (condition: () => boolean, timeoutInMilliseconds = 3000) => {
		const start = performance.now()
		while (condition() === false) {
			if (performance.now() - start > timeoutInMilliseconds) {
				throw new Error('The condition has not been met in time.')
			}
			await new Promise(resolve => setTimeout(resolve, 10))
		}
	}

	beforeEach(() => fetchSpy.calls.reset())

	afterEach(() => new Promise(resolve => setTimeout(resolve, 50)))

	it('should throw when used without an mo-fetchable-dialog element', async () => {
		const dialog = new DialogWithoutFetchableDialogTest({})
		document.body.appendChild(dialog)
		await dialog.updateComplete

		try {
			expect(dialog.renderRoot.querySelector('mo-dialog')).not.toBeNull()
			expect(() => dialog.dialogElement).toThrowError('FetchableDialogComponent must be used with an mo-fetchable-dialog element or a subclass thereof')
		} finally {
			dialog.remove()
		}
	})

	describe('with an id', () => {
		const fixture = new ComponentTestFixture<DialogTest>(() => new DialogTest({ id: 7 }))

		const renderedName = () => fixture.component.renderRoot.querySelector('#name')?.textContent?.trim()

		it('should fetch the entity with the given id and expose it as entity once connected', async () => {
			await waitUntil(() => renderedName() === 'Item 7')

			expect(fetchSpy).toHaveBeenCalledOnceWith(7)
			expect(fixture.component['entity']).toEqual({ id: 7, name: 'Item 7' })
		})

		it('should bind dialog fields to the entity via entityBinder', async () => {
			await waitUntil(() => renderedName() === 'Item 7')
			const field = fixture.component.renderRoot.querySelector<HTMLInputElement>('#name-field')!

			expect(field.value).toBe('Item 7')

			field.value = 'Renamed'
			field.dispatchEvent(new Event('change'))
			await fixture.updateComplete

			expect(fixture.component['entity'].name).toBe('Renamed')
			expect(renderedName()).toBe('Renamed')
		})
	})

	describe('without an id', () => {
		const fixture = new ComponentTestFixture<DialogTest>(() => new DialogTest({}))

		it('should use the preset entity without fetching when no id is passed', async () => {
			await waitUntil(() => fixture.component.fetcherController.value !== undefined)
			await fixture.updateComplete

			expect(fetchSpy).not.toHaveBeenCalled()
			expect(fixture.component['entity']).toEqual({ id: 0, name: 'Preset' })
			expect(fixture.component.renderRoot.querySelector('#name')?.textContent?.trim()).toBe('Preset')
		})
	})
})