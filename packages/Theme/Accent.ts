import { isServer } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'
import { Color } from '@3mo/color'

export class AccentStorage extends LocalStorage<string | undefined> {
	constructor() {
		super('Theme.Accent', 'rgb(0, 119, 200)')
		this.setProperty()
	}

	override get value() { return super.value }
	override set value(value: string | undefined) {
		super.value = value
		if (!value && !isServer) {
			localStorage.removeItem(this.name)
		}
		this.setProperty()
	}

	toColor() {
		return !this.value ? undefined : new Color(this.value)
	}

	private setProperty() {
		globalThis.document.documentElement.style.setProperty('--mo-color-accent', this.value!)
	}
}