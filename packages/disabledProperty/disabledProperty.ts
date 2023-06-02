import { css, LitElement, property, type UpdatedCallback } from '@a11d/lit'

const tabIndexBeforeDisabledSymbol = Symbol()

export const disabledProperty = (options?: {
	blockFocus?: boolean
	updated?: UpdatedCallback<boolean> | undefined
}) => {
	return (prototype: LitElement, propertyKey: 'disabled') => {
		const constructor = prototype.constructor as typeof LitElement
		property({
			type: Boolean,
			reflect: true,
			updated(this: HTMLElement, value: boolean, oldValue: boolean) {
				options?.updated?.call(this, value, oldValue)
				if (value) {
					this.setAttribute('aria-disabled', 'true')
				} else {
					this.removeAttribute('aria-disabled')
				}
				if (options?.blockFocus) {
					const element = this as HTMLElement & { [tabIndexBeforeDisabledSymbol]: number | undefined }

					if (value && this.tabIndex !== -1) {
						element[tabIndexBeforeDisabledSymbol] = this.tabIndex
						this.tabIndex = -1
					}

					if (!value && element[tabIndexBeforeDisabledSymbol] !== undefined) {
						this.tabIndex = element[tabIndexBeforeDisabledSymbol]
						element[tabIndexBeforeDisabledSymbol] = undefined
					}
				}
			}
		})(prototype, propertyKey)

		constructor.elementStyles.push(css`
			:host([disabled]) {
				pointer-events: none;
			}
		`)
	}
}