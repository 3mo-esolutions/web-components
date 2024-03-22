import { property, ReactiveElement, type UpdatedCallback } from '@a11d/lit'

const tabIndexBeforeDisabledSymbol = Symbol('tabIndexBeforeDisabledSymbol')

/**
 * A decorator that adds a disabled property to a reactive element, with ability to block focus when disabled.
 *
 * @ssr true
 */
export const disabledProperty = (options?: {
	blockFocus?: boolean
	updated?: UpdatedCallback<boolean>
}) => {
	return (prototype: ReactiveElement, propertyKey: 'disabled') => {
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
	}
}