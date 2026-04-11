import { isServer } from '@a11d/lit'
import { LocalStorage } from '@a11d/local-storage'

export enum Background {
	Light = 'light',
	Dark = 'dark',
}

export class BackgroundStorage extends LocalStorage<Background | undefined> {
	constructor() {
		super('Theme.Background', undefined)
		if (isServer) return
		window.matchMedia('(prefers-color-scheme: dark)').onchange = () => this.setCssColorScheme()
		window.matchMedia('(prefers-color-scheme: light)').onchange = () => this.setCssColorScheme()
		this.setCssColorScheme()
		this.changed.subscribe(() => this.setCssColorScheme())
	}

	get calculatedValue() {
		return this.value !== undefined
			? this.value
			: (!isServer && window.matchMedia('(prefers-color-scheme: dark)').matches)
				? Background.Dark
				: Background.Light
	}

	private get cssColorScheme() {
		switch (this.value) {
			case Background.Light:
				return 'light'
			case Background.Dark:
				return 'dark'
			default:
				return 'light dark'
		}
	}

	private setCssColorScheme() {
		document.documentElement.style.colorScheme = this.cssColorScheme
	}
}