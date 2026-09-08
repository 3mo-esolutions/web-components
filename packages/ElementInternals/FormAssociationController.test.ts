import { component, Component, html, property, query } from '@a11d/lit'
import { FormAssociationController } from './FormAssociationController.js'
import { formAssociated, type FormRestoreReason, type FormRestoreState } from './formAssociated.js'

@component('form-association-test-field')
@formAssociated
class TestField extends Component {
	@property() value?: string
	@property({ type: Boolean }) required = false

	defaultValue?: string
	resets = 0
	readonly restorations = new Array<[FormRestoreState | null, FormRestoreReason]>()
	readonly disabledChanges = new Array<boolean>()

	@query('input') readonly inputElement?: HTMLInputElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.value },
		get validity() { return host.inputElement ?? undefined },
		handleReset: () => {
			host.resets++
			host.value = host.defaultValue
		},
		handleRestore: (state, reason) => host.restorations.push([state, reason]),
		handleDisabledChange: disabled => host.disabledChanges.push(disabled),
	}))

	protected override get template() {
		return html`<input .value=${this.value ?? ''} ?required=${this.required}>`
	}
}

/** A host which works its validity out itself instead of reading it off an element. */
@component('form-association-test-switch')
@formAssociated
class TestSwitch extends Component {
	@property({ type: Boolean }) selected = false
	@property({ type: Boolean }) required = false
	@property() validationMessage = ''

	@query('button') readonly buttonElement?: HTMLButtonElement

	readonly formAssociation = new FormAssociationController(this, host => ({
		get value() { return host.selected ? 'on' : undefined },
		get state() { return String(host.selected) },
		get validity() {
			return {
				validity: { valueMissing: host.required && !host.selected },
				validationMessage: host.validationMessage,
			}
		},
		get anchor() { return host.buttonElement ?? undefined },
	}))

	protected override get template() {
		return html`<button type='button' role='switch'>${this.selected}</button>`
	}
}

describe('FormAssociationController', () => {
	let form: HTMLFormElement
	let field: TestField

	const entries = () => [...new FormData(form)]
	const tick = () => new Promise(resolve => setTimeout(resolve))

	beforeEach(async () => {
		form = document.createElement('form')
		field = new TestField()
		field.setAttribute('name', 'field')
		form.append(field)
		document.body.append(form)
		await field.updateComplete
	})

	afterEach(() => form.remove())

	describe('the declaration', () => {
		it('marks the class form-associated', () => {
			expect((TestField as unknown as { formAssociated: boolean }).formAssociated).toBe(true)
		})

		it('carries over to a class extending a declared one', async () => {
			@component('form-association-test-derived')
			class Derived extends TestField { }

			const derived = new Derived()
			derived.setAttribute('name', 'derived')
			derived.value = 'inherited'
			form.append(derived)
			await derived.updateComplete

			expect(entries()).toContain(['derived', 'inherited'])
		})

		it('is required - a controller on an undeclared host says so', () => {
			@component('form-association-test-undeclared')
			class Undeclared extends Component {
				readonly formAssociation = new FormAssociationController(this)
			}

			expect(() => new Undeclared()).toThrowError(/does not take part in forms/)
		})
	})

	describe('the form value', () => {
		it('is submitted under the name attribute', async () => {
			field.value = 'typed'
			await field.updateComplete
			expect(entries()).toEqual([['field', 'typed']])
		})

		it('reaches the form before the update lands, as a native control does', () => {
			field.value = 'immediate'
			expect(entries()).toEqual([['field', 'immediate']])
		})

		it('submits an empty entry for an empty value, and none at all for no value', async () => {
			field.value = ''
			await field.updateComplete
			expect(entries()).toEqual([['field', '']])

			field.value = undefined
			await field.updateComplete
			expect(entries()).toEqual([])
		})

		it('is left out while the host is disabled', async () => {
			field.value = 'typed'
			field.toggleAttribute('disabled', true)
			await field.updateComplete
			expect(entries()).toEqual([])
		})

		it('reports the form it belongs to, and the labels pointing at it', () => {
			const label = document.createElement('label')
			label.htmlFor = 'labelled-field'
			field.id = 'labelled-field'
			form.append(label)

			expect(field.formAssociation.form).toBe(form)
			expect([...field.formAssociation.labels]).toEqual([label])
		})
	})

	describe('validity', () => {
		beforeEach(async () => {
			field.required = true
			await field.updateComplete
		})

		it('adopts the validity of the element it is given', () => {
			expect(field.formAssociation.checkValidity()).toBe(false)
			expect(field.formAssociation.validity.valueMissing).toBe(true)
			expect(field.formAssociation.validationMessage).toBe(field.inputElement!.validationMessage)
		})

		it('marks the host invalid and blocks the form', () => {
			expect(field.matches(':invalid')).toBe(true)
			expect(form.checkValidity()).toBe(false)
		})

		it('clears once the constraint is satisfied', async () => {
			field.value = 'something'
			await field.updateComplete

			expect(field.matches(':valid')).toBe(true)
			expect(form.checkValidity()).toBe(true)
			expect(field.formAssociation.validationMessage).toBe('')
		})

		it('settles on the element rendered by the update which changed it', async () => {
			field.value = 'something'
			expect(field.formAssociation.validity.valueMissing).toBe(true)

			await field.updateComplete
			expect(field.formAssociation.validity.valueMissing).toBe(false)
		})

		it('anchors the platform at the element the validity came from', () => {
			expect(form.reportValidity()).toBe(false)
			expect(field.shadowRoot?.activeElement).toBe(field.inputElement!)
		})

		it('stops being a candidate while the host is disabled or readonly', async () => {
			expect(field.formAssociation.willValidate).toBe(true)

			field.toggleAttribute('readonly', true)
			await field.updateComplete
			expect(field.formAssociation.willValidate).toBe(false)
			expect(form.checkValidity()).toBe(true)
		})
	})

	describe('a validity the host works out itself', () => {
		let host: TestSwitch

		beforeEach(async () => {
			host = new TestSwitch()
			host.setAttribute('name', 'switch')
			form.append(host)
			await host.updateComplete
		})

		it('submits its value only while selected', async () => {
			expect(entries()).toEqual([])

			host.selected = true
			await host.updateComplete
			expect(entries()).toEqual([['switch', 'on']])
		})

		it('blocks the form on a violation of its own', async () => {
			host.required = true
			host.validationMessage = 'Please switch this on'
			await host.updateComplete

			expect(form.checkValidity()).toBe(false)
			expect(host.formAssociation.validationMessage).toBe('Please switch this on')
		})

		it('stands a message in rather than letting the platform refuse an empty one', async () => {
			host.required = true
			await host.updateComplete

			expect(host.formAssociation.validationMessage).toBe(FormAssociationController.defaultValidationMessage)
		})

		it('is anchored at the element it names, having none to read validity off', async () => {
			host.required = true
			await host.updateComplete

			expect(form.reportValidity()).toBe(false)
			expect(host.shadowRoot?.activeElement).toBe(host.buttonElement!)
		})
	})

	describe('the form lifecycle', () => {
		it('hands a reset to the host, which restores its own default', async () => {
			field.defaultValue = 'default'
			field.value = 'typed'
			await field.updateComplete

			form.reset()
			await field.updateComplete

			expect(field.resets).toBe(1)
			expect(field.value).toBe('default')
			expect(entries()).toEqual([['field', 'default']])
		})

		it('hands over a state the browser restores', () => {
			(field as unknown as { formStateRestoreCallback(state: FormRestoreState, reason: FormRestoreReason): void })
				.formStateRestoreCallback('restored', 'autocomplete')

			expect(field.restorations).toEqual([['restored', 'autocomplete']])
		})

		it('follows a fieldset which disables it', async () => {
			const fieldset = document.createElement('fieldset')
			form.append(fieldset)
			fieldset.append(field)

			fieldset.disabled = true
			await tick()
			expect(field.disabledChanges).toEqual([true])

			fieldset.disabled = false
			await tick()
			expect(field.disabledChanges).toEqual([true, false])
		})
	})
})