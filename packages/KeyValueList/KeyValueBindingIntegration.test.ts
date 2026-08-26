import { Component, bind, component, html, property } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import '@a11d/metadata'
import { type KeyValue } from './KeyValue.js'
import './index.js'

class TestSubject {
	@label('First label') first? = 'first value'
	@label('Second label') second? = 'second value'
	@label('Read-only label') get readOnly() { return 'read-only value' }
}

@component('key-value-binding-integration-test')
class TestHost extends Component {
	@property({ type: Object }) subject = new TestSubject()
	@property() keyPath: 'first' | 'second' = 'first'

	get keyValues() { return [...this.renderRoot.querySelectorAll('mo-key-value')] as Array<KeyValue> }

	protected override get template() {
		return html`
			<mo-key-value ${bind(this, 'subject', { keyPath: 'first' })}></mo-key-value>
			<mo-key-value key='Given' ${bind(this, 'subject', { keyPath: 'first' })}></mo-key-value>
			<mo-key-value ${bind(this, 'subject', { keyPath: 'readOnly' })}></mo-key-value>
			<mo-key-value ${bind(this, 'subject', { keyPath: this.keyPath })}></mo-key-value>
		`
	}
}

describe('KeyValueBindingIntegration', () => {
	const fixture = new ComponentTestFixture<TestHost>(html`<key-value-binding-integration-test></key-value-binding-integration-test>`)

	const [bound, given, readOnly, switching] = [0, 1, 2, 3]
	const keyValue = (index: number) => fixture.component.keyValues[index]!

	it('should write the value of the bound property', () => {
		expect(keyValue(bound).value).toBe('first value')
		expect(keyValue(bound).empty).toBe(false)
	})

	it('should derive the key from the label of the bound property', () => {
		expect(keyValue(bound).key).toBe('First label')
	})

	it('should keep a key the consumer has given', () => {
		expect(keyValue(given).key).toBe('Given')
		expect(keyValue(given).value).toBe('first value')
	})

	it('should resolve the key anew once the key-path changes', async () => {
		expect(keyValue(switching).key).toBe('First label')

		fixture.component.keyPath = 'second'
		await fixture.updateComplete
		await keyValue(switching).updateComplete

		expect(keyValue(switching).key).toBe('Second label')
		expect(keyValue(switching).value).toBe('second value')
	})

	it('should write the value of a read-only property', () => {
		expect(keyValue(readOnly).value).toBe('read-only value')
	})

	/**
	 * A read-only source makes the binding one-way, and `ValueBinder` invokes its integrations only from the
	 * branch which writes back to the source. Until that loop is moved out of the branch, a getter-backed
	 * property yields a value but no key.
	 */
	it('should derive the key of a read-only property', () => {
		pending('"@a11d/lit" skips binding integrations for one-way bindings')

		expect(keyValue(readOnly).key).toBe('Read-only label')
	})
})