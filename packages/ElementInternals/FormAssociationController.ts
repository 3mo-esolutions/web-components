import { Controller, isServer, type ReactiveElement } from '@a11d/lit'
import { elementInternals } from './elementInternals.js'
import { formAssociations, type FormRestoreReason, type FormRestoreState } from './formAssociated.js'

/** A value a form can carry for one of its controls. */
export type FormValue = string | File | FormData

/** Constraint validation the host presents to the platform - a rendered input, or a state it works out itself. */
export type FormValidity = {
	readonly validity: ValidityStateFlags
	readonly validationMessage: string
}

export interface FormAssociationControllerOptions {
	/** The value submitted with the form. `undefined` submits nothing, as a disabled control does. */
	value?: FormValue
	/** What the browser keeps to restore the host with. Defaults to the value. */
	state?: FormValue
	/** The host's constraint validation. */
	validity?: FormValidity
	/** The element the platform points its message at and focuses. Defaults to the validity, when that is an element, and has to be inside the host. */
	anchor?: HTMLElement
	/** Called when the form is reset, for the host to restore its default. */
	handleReset?(): void
	/** Called when the browser restores a value, on a history navigation or an autofill. */
	handleRestore?(state: FormRestoreState | null, reason: FormRestoreReason): void
	/** Called when the host, or a fieldset around it, is disabled or enabled. */
	handleDisabledChange?(disabled: boolean): void
}

/**
 * Makes the host a form control: it submits a value, blocks submission while invalid, and follows
 * resets, fieldsets and restorations as a native control does.
 *
 * The class needs {@link formAssociated} beside it - the platform reads that declaration while the
 * element is being defined, which is before any controller exists.
 *
 * ```ts
 * @component('mo-rating')
 * @formAssociated
 * export class Rating extends Component {
 *     readonly formAssociation = new FormAssociationController(this, host => ({
 *         get value() { return host.value?.toString() },
 *         get validity() { return host.inputElement },
 *     }))
 * }
 * ```
 *
 * @ssr true
 */
export class FormAssociationController<THost extends ReactiveElement = ReactiveElement> extends Controller {
	/** Stands in when the host reports a violation without a message, which the platform refuses. */
	static defaultValidationMessage = 'Invalid'

	private static readonly violations = [
		'badInput', 'customError', 'patternMismatch', 'rangeOverflow', 'rangeUnderflow',
		'stepMismatch', 'tooLong', 'tooShort', 'typeMismatch', 'valueMissing',
	] as const satisfies ReadonlyArray<keyof ValidityStateFlags>

	protected readonly options?: FormAssociationControllerOptions

	constructor(
		protected override readonly host: THost,
		options?: FormAssociationControllerOptions | ((host: THost) => FormAssociationControllerOptions)
	) {
		super(host)
		this.options = typeof options === 'function' ? options(host) : options
		if ((host.constructor as { formAssociated?: boolean }).formAssociated !== true) {
			throw new Error(`<${host.localName}> does not take part in forms. Decorate its class with "@formAssociated".`)
		}
		formAssociations.set(host, this)
	}

	private get internals() {
		return elementInternals(this.host)
	}

	/** The form the host submits with. */
	get form() {
		return this.internals.form
	}

	/** The labels pointing at the host. */
	get labels() {
		return this.internals.labels
	}

	get validity() {
		this.sync()
		return this.internals.validity
	}

	get validationMessage() {
		this.sync()
		return this.internals.validationMessage
	}

	/** Whether the host is a candidate for constraint validation, which a disabled or readonly one is not. */
	get willValidate() {
		this.sync()
		return this.internals.willValidate
	}

	checkValidity() {
		this.sync()
		return this.internals.checkValidity()
	}

	reportValidity() {
		this.sync()
		return this.internals.reportValidity()
	}

	/** Writes the host's value and validity to the platform. Runs on every update - call it only for state which no reactive property holds. */
	sync() {
		if (isServer) {
			return
		}
		const { value, state, validity } = this.options ?? {}
		this.internals.setFormValue(value ?? null, state ?? value ?? null)
		const violated = FormAssociationController.violations.some(violation => validity?.validity[violation])
		const anchor = this.options?.anchor ?? (validity instanceof HTMLElement ? validity : undefined)
		this.internals.setValidity(
			validity?.validity ?? {},
			!violated ? '' : validity?.validationMessage || FormAssociationController.defaultValidationMessage,
			anchor?.isConnected ? anchor : undefined,
		)
	}

	handleReset() {
		this.options?.handleReset?.()
		this.sync()
	}

	handleRestore(state: FormRestoreState | null, reason: FormRestoreReason) {
		this.options?.handleRestore?.(state, reason)
		this.sync()
	}

	handleDisabledChange(disabled: boolean) {
		this.options?.handleDisabledChange?.(disabled)
	}

	override hostConnected() {
		this.sync()
	}

	override hostUpdated() {
		this.sync()
	}
}