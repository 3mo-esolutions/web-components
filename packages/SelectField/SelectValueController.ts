import { Controller } from '@a11d/lit'
import { Selectability, SelectabilityBehaviorOnItemsChange, SelectabilityController, SelectabilityInteraction } from '@3mo/selectability'
import type { Option } from './Option.js'
import type { FieldSelect } from './FieldSelect.js'

type PluralizeUnion<T> = Array<T> | T | undefined

export type Value = PluralizeUnion<string | number>
export type Data<T> = PluralizeUnion<T>
export type Index = PluralizeUnion<number>

type SelectionRequest = { readonly origin: SelectionOrigin, readonly values: ReadonlyArray<unknown> }

type SelectionOrigin = 'value' | 'index' | 'data'

type Selection<T> = { readonly value: Value, readonly index: Index, readonly data: Data<T> }

/**
 * Narrower than {@link SelectabilityController}'s own type on purpose: that one reaches its registry's
 * item directive, which puts the item in a parameter position and would leave `FieldSelect<Person>` no
 * longer the `FieldSelect<unknown>` its tag name is declared as. Widen as more of the controller is used.
 */
type Selecting<T> = {
	selection: ReadonlyArray<T>
	isSelected(item: T): boolean
	handleItemsChange(behavior?: SelectabilityBehaviorOnItemsChange): void
}

function same(value: unknown, other: unknown) {
	return value instanceof Array && other instanceof Array
		? value.length === other.length && value.every((member, index) => member === other[index])
		: value === other
}

/**
 * The field's selection: one set of options, of which `value`, `index` and `data` are three views.
 *
 * A write to any of the three is kept as a request and re-applied whenever the options change, so an
 * option arriving later still answers it. The answer is written back onto all three and recognized as
 * this controller's own when it comes around again, which is what lets the three coexist without fencing
 * each other. A selection made in the menu becomes a request too, phrased in whatever identity its
 * options carry, so it survives a refetch that reorders or re-instantiates them.
 */
export class FieldSelectValueController<T> extends Controller {
	private readonly selectability: Selecting<Option<T>>

	constructor(protected override readonly host: FieldSelect<T>) {
		super(host)
		this.selectability = new SelectabilityController<Option<T>>(this.host, {
			get selectability() { return host.multiple ? Selectability.Multiple : Selectability.Single },
			get items() { return host.options },
			key: option => FieldSelectValueController.keyOf(option),
			behaviorOnItemsChange: SelectabilityBehaviorOnItemsChange.Maintain,
			interaction: SelectabilityInteraction.Manual,
			stamping: false,
			handleChange: () => this.commit(),
		})
	}

	private request?: SelectionRequest
	private published?: Selection<T>
	private _menuValue = new Array<number>()
	private syncing = false

	private static keyOf<T>(option: Option<T>) {
		return option.data !== undefined ? JSON.stringify(option.data) : option.normalizedValue ?? option
	}

	get selection() { return this.selectability.selection }

	get menuValue() { return this._menuValue }

	isSelected(option: Option<T>) {
		return this.selectability.isSelected(option)
	}

	/** A write to one of the host's three properties — a request, unless it is our own answer coming back. */
	accept(origin: SelectionOrigin) {
		const value = this.host[origin]
		if (same(value, this.published?.[origin]) === false) {
			this.request = { origin, values: value === undefined ? [] : value instanceof Array ? value : [value] }
			this.requestSync()
		}
	}

	/** Becomes a request itself, so a menu selection survives the options being replaced as a written one does. */
	selectFromMenu(menuValue: ReadonlyArray<number>) {
		this.selectability.selection = this.host.options.filter(option => option.index !== undefined && menuValue.includes(option.index))
		this.request = FieldSelectValueController.requestFor(this.selection)
		this.commit()
	}

	private static requestFor<T>(options: ReadonlyArray<Option<T>>): SelectionRequest {
		return options.length > 0 && options.every(option => option.data !== undefined)
			? { origin: 'data', values: options.map(option => option.data) }
			: options.length > 0 && options.every(option => option.normalizedValue !== undefined)
				? { origin: 'value', values: options.map(option => option.normalizedValue) }
				: { origin: 'index', values: options.map(option => option.index).filter(index => index !== undefined) }
	}

	handleItemsChange() {
		this.resolve()
		this.commit()
	}

	/** Coalesces one items change's storm of notifications, and lets several writes in the same update
	 * settle as the last of them rather than as whichever resolved first. */
	requestSync() {
		if (this.syncing === false) {
			this.syncing = true
			queueMicrotask(() => {
				this.syncing = false
				this.handleItemsChange()
			})
		}
	}

	private resolve() {
		if (!this.request) {
			this.selectability.handleItemsChange(SelectabilityBehaviorOnItemsChange.Maintain)
		} else {
			const request = this.request
			this.selectability.selection = this.host.options.filter(option => FieldSelectValueController.matches(option, request))
		}
	}

	private static matches<T>(option: Option<T>, { origin, values }: SelectionRequest) {
		switch (origin) {
			case 'value':
				return values.some(value => option.valueMatches(value as string | number | undefined))
			case 'index':
				return option.index !== undefined && values.includes(option.index)
			case 'data':
				return option.data !== undefined && values.some(data => option.dataMatches(data as T))
		}
	}

	/** Held back until something has resolved once, so a value set before its option exists stands rather
	 * than being answered with an empty selection. */
	private commit() {
		const options = this.selection
		if (!this.published && options.length === 0) {
			return
		}
		const indices = options.map(option => option.index).filter(index => index !== undefined)
		const selection = {
			value: this.pluralize(options.map(option => option.normalizedValue)) as Value,
			index: this.pluralize(indices) as Index,
			data: this.pluralize(options.map(option => option.data)) as Data<T>,
		}
		if (!this.published || (['value', 'index', 'data'] as const).some(origin => same(selection[origin], this.published![origin]) === false)) {
			this._menuValue = indices
			this.published = selection
			this.host.value = selection.value
			this.host.index = selection.index
			this.host.data = selection.data
		}
		this.host.requestValueUpdate()
	}

	private pluralize<V>(values: Array<V>) {
		return this.host.multiple ? values : values[0]
	}
}