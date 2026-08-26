import { BindingIntegration, bindingIntegration } from '@a11d/lit'
import { KeyValue } from './KeyValue.js'
import '@a11d/metadata'

type ValueBinder = Parameters<BindingIntegration['bind']>[0]

/**
 * Derives the key of a bound `mo-key-value` from the `label` of the model property it is bound to, so that
 * `${bind(this, 'order', { keyPath: 'paymentMethodName' })}` alone yields both halves of the pair.
 *
 * A key the consumer has given wins. The derived one is remembered, so that a binding whose key-path changes
 * is resolved anew instead of keeping the label of the path it first rendered with.
 */
@bindingIntegration()
export class KeyValueBindingIntegration extends BindingIntegration {
	private static readonly derivedKeys = new WeakMap<KeyValue, string>()

	override bind(valueBinder: ValueBinder) {
		const { element, component, source, sourceKey, keyPath } = valueBinder

		if (element instanceof KeyValue === false) {
			return
		}

		if (element.key !== undefined && element.key !== KeyValueBindingIntegration.derivedKeys.get(element)) {
			return
		}

		const derived = keyPath
			? source === undefined || source === null ? undefined : label.getByKeyPath(source.constructor, keyPath)
			: label.get(component.constructor, sourceKey)

		const key = derived?.toString().trim() || ''

		if (!key) {
			return
		}

		KeyValueBindingIntegration.derivedKeys.set(element, key)
		element.key = key
	}
}