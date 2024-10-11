import type { Option } from './Option.js'
import { type FieldSelect } from './FieldSelect.js'

type PluralizeUnion<T> = Array<T> | T | undefined

export type Value = PluralizeUnion<string | number>
export type Data<T> = PluralizeUnion<T>
export type Index = PluralizeUnion<number>

export class FieldSelectValueController<T> {
	static readonly requestSyncKey = 'requestSync'

	private preventSync = false

	private _menuValue = new Array<number>()
	get menuValue() { return this._menuValue }
	set menuValue(value) {
		this.preventSync = true
		this._menuValue = value
		this.select.index = this.index
		this.select.value = this.value
		this.select.data = this.data
		this.select.requestValueUpdate()
		this.select.updateComplete.then(() => setTimeout(() => this.preventSync = false, 5))
	}

	constructor(protected readonly select: FieldSelect<T>) { }

	get selectedOptions() { return this.select.options.filter(o => o.index !== undefined && this.menuValue.includes(o.index)) }
	get multiple() { return this.select.multiple }

	private selectionOrigin?: 'index' | 'data' | 'value'

	private _index?: Index
	get index() { return this.getSelectValue(this.menuValue) as Index }
	set index(value) {
		this._index = value
		if (this.preventSync === false) {
			this.selectionOrigin = 'index'
			this.setSelectValue(value, (o, indices) => o.index !== undefined && indices.includes(o.index))
		}
	}

	private _value?: Value
	get value() { return this.getSelectValue(this.selectedOptions.map(o => o.normalizedValue)) as Value }
	set value(value) {
		this._value = value
		if (this.preventSync === false) {
			this.selectionOrigin = 'value'
			this.setSelectValue(value, (o, values) => values.some(v => o.valueMatches(v)))
		}
	}

	private _data?: Data<T>
	get data() { return this.getSelectValue(this.selectedOptions.map(o => o.data)) as Data<T> }
	set data(value) {
		this._data = value
		if (this.preventSync === false) {
			this.selectionOrigin = 'data'
			this.setSelectValue(value, (o, data) => o.data !== undefined && data.some(d => o.dataMatches(d)))
		}
	}

	requestSync() {
		this.select[FieldSelectValueController.requestSyncKey]++
	}

	sync() {
		switch (this.selectionOrigin) {
			case 'index':
				this.index = this._index
				break
			case 'data':
				this.data = this._data
				break
			case 'value':
				this.value = this._value
				break
		}
	}

	private getSelectValue<T>(value: PluralizeUnion<T>) {
		const v = value instanceof Array ? value : [value] as Array<T>
		return this.multiple ? v : v[0]
	}
	private async setSelectValue<T>(value: PluralizeUnion<T>, predicate: (option: Option<T>, arrayValue: Array<T>) => boolean) {
		await new Promise(r => setTimeout(r, 0))
		const array = value instanceof Array ? value : [value] as Array<T>
		const newIndices = this.select.options
			.filter(o => array.some(() => predicate(o as any, array)))
			.map(o => o.index)
			.filter(i => i !== undefined) as Array<number>

		const equals = newIndices.length === this.menuValue.length && newIndices.every(i => this.menuValue.includes(i))
		if (equals === false) {
			this.menuValue = newIndices
		}
	}
}