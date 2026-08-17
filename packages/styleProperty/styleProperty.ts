import { isServer, property, type ReactiveElement } from '@a11d/lit'

/**
 * A decorator factory that defines a property that reflects a style property.
 *
 * @ssr true
 *
 * @param options - Options for configuring the property.
 * @param options.styleKey - The name of the style property to reflect. Also supports custom CSS properties (e.g. `--custom-property`).
 * @param options.styleConverter - An object with two functions to convert the value to and from the style property.
 */
export const styleProperty = (options?: Parameters<typeof property>[0] & {
	styleKey: (keyof CSSStyleDeclaration & string) | `--${string}`
	styleConverter?: {
		toStyle(value: any): string
		fromStyle(value: string): any
	}
}) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const key = options?.styleKey ?? propertyKey as any
		const isCustomProperty = key.startsWith('--')
		const converter = options?.styleConverter ?? {
			toStyle: (value: any) => value,
			fromStyle: (value: string) => value,
		}

		const getStyle = (style: CSSStyleDeclaration) => isCustomProperty ? style.getPropertyValue(key) : style[key]! as string

		Object.defineProperty(prototype, propertyKey, {
			get(this: ReactiveElement) {
				return isServer ? '' : converter.fromStyle(getStyle(this.style))
			},
			set(this: ReactiveElement, value: string) {
				if (isServer === false) {
					const oldValue = converter.fromStyle(getStyle(this.style))
					if (isCustomProperty) {
						this.style.setProperty(key, converter.toStyle(value))
					} else {
						this.style[key] = converter.toStyle(value)
					}
					this.requestUpdate(propertyKey, oldValue)
				}
			},
		})

		return property({ ...options, noAccessor: true })(prototype, propertyKey)
	}
}