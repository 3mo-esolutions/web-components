import type { Option } from './Option.js'
import type { FieldSelect } from './FieldSelect.js'

type PluralizeUnion<T> = Array<T> | T | undefined

export type Value = PluralizeUnion<string | number>
export type Data<T> = PluralizeUnion<T>
export type Index = PluralizeUnion<number>

export class FieldSelectValueController<T> {
	private _menuValue = new Array<number>()
	get menuValue() { return this._menuValue }
	set menuValue(value) {
		this._menuValue = value
		this.options.forEach(o => o.selected = o.index !== undefined && value.includes(o.index))
		this.update()
	}

	constructor(protected readonly select: FieldSelect<T>, protected readonly update: () => void) { }

	get options() {
		this.select.options.forEach(o => o.index = this.select.listItems.indexOf(o))
		return this.select.options
	}

	get selectedOptions() { return this.select.selectedOptions }
	get multiple() { return this.select.multiple }

	get index() { return this.getSelectValue(this.selectedOptions.map(o => o.index)) as Index }
	set index(value) { this.setSelectValue(value, (o, indices) => o.index !== undefined && indices.includes(o.index)) }

	get data() { return this.getSelectValue(this.selectedOptions.map(o => o.data)) as Data<T> }
	set data(value) { this.setSelectValue(value, (o, data) => !!o.data && data.some(d => o.dataMatches(d))) }

	get value() { return this.getSelectValue(this.selectedOptions.map(o => o.normalizedValue)) as Value }
	set value(value) { this.setSelectValue(value, (o, values) => values.some(v => o.valueMatches(v))) }

	private getSelectValue<T>(value: PluralizeUnion<T>) {
		const v = value instanceof Array ? value : [value] as Array<T>
		return this.multiple ? v : v[0]
	}
	private setSelectValue<T>(value: PluralizeUnion<T>, predicate: (option: Option<T>, arrayValue: Array<T>) => boolean) {
		const array = value instanceof Array ? value : [value] as Array<T>
		const newIndices = this.options
			.filter(o => array.some(() => predicate(o as any, array)))
			.map(o => o.index)
			.filter(i => i !== undefined) as Array<number>

		const isSame = newIndices.length === this.menuValue.length && newIndices.every(i => this.menuValue.includes(i))
		if (isSame === false) {
			this.menuValue = newIndices
		}
	}
}