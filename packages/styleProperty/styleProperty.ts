import { isServer, property, ReactiveElement } from '@a11d/lit'

export const styleProperty = (options?: Parameters<typeof property>[0] & {
	styleKey: keyof CSSStyleDeclaration & string
	styleConverter?: {
		toStyle(value: any): string
		fromStyle(value: string): any
	}
}) => {
	return (prototype: ReactiveElement, propertyKey: PropertyKey) => {
		const key = options?.styleKey ?? propertyKey as any
		const converter = options?.styleConverter ?? {
			toStyle: (value: any) => value,
			fromStyle: (value: string) => value,
		}

		Object.defineProperty(prototype, propertyKey, {
			get(this: ReactiveElement) {
				return isServer ? '' : converter.fromStyle(this.style[key]!)
			},
			set(this: ReactiveElement, value: string) {
				if (isServer === false) {
					const oldValue = converter.fromStyle(this.style[key]!)
					this.style[key] = converter.toStyle(value)
					this.requestUpdate(propertyKey, oldValue)
				}
			},
		})

		return property({ ...options, noAccessor: true })(prototype, propertyKey)
	}
}