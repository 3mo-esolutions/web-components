import { Component, component, html, query, state } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { observeMutation } from './observeMutation.js'

@component('observe-mutation-test-component')
class ObserveMutationTestComponent extends Component {
	readonly childListCallback = jasmine.createSpy<MutationCallback>('childListCallback')
	readonly attributesCallback = jasmine.createSpy<MutationCallback>('attributesCallback')
	readonly slotCallback = jasmine.createSpy<MutationCallback>('slotCallback')

	@query('div#child-list') readonly childListElement!: HTMLDivElement
	@query('div#attributes') readonly attributesElement!: HTMLDivElement

	@state() shallRender = true

	protected override get template() {
		return !this.shallRender ? html.nothing : html`
			<div id='child-list' ${observeMutation(this.childListCallback)}></div>
			<div id='attributes' ${observeMutation(this.attributesCallback, { attributes: true })}></div>
			<slot ${observeMutation(this.slotCallback)}></slot>
		`
	}
}

describe('observeMutation', () => {
	const fixture = new ComponentTestFixture(() => new ObserveMutationTestComponent)

	const tick = () => new Promise(resolve => setTimeout(resolve, 10))

	const recordsOfLastCall = (callback: jasmine.Spy<MutationCallback>) => callback.calls.mostRecent().args[0]

	it('should invoke the callback when a child is added to the element', async () => {
		const child = document.createElement('span')

		fixture.component.childListElement.append(child)
		await tick()

		expect(fixture.component.childListCallback).toHaveBeenCalledTimes(1)
		const [record] = recordsOfLastCall(fixture.component.childListCallback)
		expect(record?.type).toBe('childList')
		expect(record?.addedNodes.length).toBe(1)
		expect(record?.addedNodes[0]).toBe(child)
	})

	it('should honor the given MutationObserverInit', async () => {
		fixture.component.attributesElement.append(document.createElement('span'))
		await tick()

		expect(fixture.component.attributesCallback).not.toHaveBeenCalled()

		fixture.component.attributesElement.setAttribute('data-state', 'open')
		await tick()

		expect(fixture.component.attributesCallback).toHaveBeenCalledTimes(1)
		const [record] = recordsOfLastCall(fixture.component.attributesCallback)
		expect(record?.type).toBe('attributes')
		expect(record?.attributeName).toBe('data-state')
	})

	it('should invoke the callback on slotchange when used on a slot element', async () => {
		const callCount = fixture.component.slotCallback.calls.count()

		fixture.component.append(document.createElement('span'))
		await tick()

		expect(fixture.component.slotCallback).toHaveBeenCalledTimes(callCount + 1)
		expect(recordsOfLastCall(fixture.component.slotCallback)).toEqual([])
	})

	it('should disconnect the observer when the directive part is disconnected', async () => {
		const element = fixture.component.childListElement

		fixture.component.shallRender = false
		await fixture.updateComplete
		await tick()

		const callCount = fixture.component.childListCallback.calls.count()
		element.append(document.createElement('span'))
		await tick()

		expect(fixture.component.childListCallback).toHaveBeenCalledTimes(callCount)
	})
})