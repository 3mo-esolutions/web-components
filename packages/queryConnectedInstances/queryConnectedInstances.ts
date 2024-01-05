import { LitElement } from '@a11d/lit'

const propertyName = Symbol('ConnectedInstances')

/**
 * Decorator that adds a property of type "Set" to a component class
 * which contains all connected instances of that component.
 *
 * @ssr true
 *
 * @example
 * ```
 * export class Foo extends Component {
 *     //` @queryConnectedInstances() static readonly instances!: Set<Foo>
 * }
 * ```
 */
export function queryConnectedInstances() {
	return (elementConstructor: typeof LitElement, propertyKey: string) => {
		Object.defineProperty(elementConstructor, propertyName, { value: new Set<LitElement>() })

		elementConstructor.addInitializer(element => element.addController({
			hostConnected: () => (element.constructor as any)[propertyName].add(element),
			hostDisconnected: () => (element.constructor as any)[propertyName].delete(element)
		}))

		Object.defineProperty(elementConstructor, propertyKey, {
			configurable: false,
			get(this: typeof LitElement) {
				return (this as any)[propertyName]
			},
		})
	}
}