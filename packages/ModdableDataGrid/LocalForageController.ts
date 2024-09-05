import { Controller } from '@a11d/lit'
import localForage from 'localforage'
import cloneDeep from 'lodash.clonedeep'

export class LocalForageController<T> extends Controller {
	static {
		localForage.setDriver([
			localForage.INDEXEDDB,
			localForage.LOCALSTORAGE,
		])
	}

	private _value?: T

	constructor(
		override readonly host: any,
		protected readonly keyName: string,
		protected readonly defaultValue?: T,
		protected readonly reviver?: ((value: any) => any),
	) {
		super(host)
	}

	override hostConnected = async () => {
		this._value = await this.read()
		this.host.requestUpdate()
	}

	get value() {
		return cloneDeep(this._value)
	}

	set value(value) {
		this._value = cloneDeep(value)
		this.write(value)
	}

	read = async () => {
		return await localForage.getItem<T>(this.keyName, (_, value) => this.reviver?.(value) ?? value) ?? this.defaultValue
	}

	write = async (value?: T) => {
		await localForage.setItem(this.keyName, value)
		this.host.requestUpdate()
	}
}