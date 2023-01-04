import { css, LitElement, property, UpdatedCallback } from '@a11d/lit'

export const disabledProperty = (options?: { updated?: UpdatedCallback<boolean> | undefined }) => {
	return (prototype: LitElement, propertyKey: 'disabled') => {
		propertyKey

		const constructor = prototype.constructor as typeof LitElement

		property({ type: Boolean, reflect: true, updated: options?.updated })(prototype, propertyKey)

		constructor.elementStyles.push(css`
			:host([disabled]) {
				pointer-events: none;
			}
		`)
	}
}