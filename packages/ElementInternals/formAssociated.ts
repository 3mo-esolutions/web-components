import type { ReactiveElement } from '@a11d/lit'

/** A value the browser hands back to restore a control - a form value, or the entries of a `FormData` one. */
export type FormRestoreState = string | File | Array<[string, FormDataEntryValue]>

/** Why the browser is restoring a control: a history navigation, or the user's autofill. */
export type FormRestoreReason = 'restore' | 'autocomplete'

type FormAssociation = {
	sync(): void
	handleReset(): void
	handleRestore(state: FormRestoreState | null, reason: FormRestoreReason): void
	handleDisabledChange(disabled: boolean): void
}

export const formAssociations = new WeakMap<HTMLElement, FormAssociation>()

const applied = Symbol('formAssociated')

/**
 * Declares that the element takes part in forms.
 *
 * The platform reads `formAssociated` and the form callbacks off the class while it is being defined,
 * so a controller cannot add them afterwards. This does, and hands them to the host's
 * `FormAssociationController`. Applied to a base class it covers everything extending it.
 *
 * @ssr true
 */
export function formAssociated(ElementConstructor: AbstractConstructor<ReactiveElement> & { prototype: ReactiveElement }) {
	if (applied in ElementConstructor) {
		return
	}

	Object.defineProperty(ElementConstructor, applied, { value: true })
	Object.defineProperty(ElementConstructor, 'formAssociated', { value: true })

	const requestUpdate = ElementConstructor.prototype.requestUpdate

	Object.assign(ElementConstructor.prototype, {
		// Forms are read synchronously, so the host's value has to reach the platform before its update lands.
		requestUpdate(this: ReactiveElement, ...parameters: Parameters<ReactiveElement['requestUpdate']>) {
			requestUpdate.apply(this, parameters)
			formAssociations.get(this)?.sync()
		},
		formResetCallback(this: ReactiveElement) {
			formAssociations.get(this)?.handleReset()
		},
		formDisabledCallback(this: ReactiveElement, disabled: boolean) {
			formAssociations.get(this)?.handleDisabledChange(disabled)
		},
		formStateRestoreCallback(this: ReactiveElement, state: FormRestoreState | null, reason: FormRestoreReason) {
			formAssociations.get(this)?.handleRestore(state, reason)
		},
	})
}