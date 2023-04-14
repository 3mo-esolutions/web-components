import { Application } from '@a11d/lit-application'
import { LocalStorage } from '@a11d/local-storage'

export const enum Background {
	System = 'system',
	Light = 'light',
	Dark = 'dark',
}

export class BackgroundStorage extends LocalStorage<Background> {
	private application?: Application

	constructor() {
		super('Theme.Background', Background.System)
		window.matchMedia('(prefers-color-scheme: dark)').onchange = () => this.updateAttributeValue()
		window.matchMedia('(prefers-color-scheme: light)').onchange = () => this.updateAttributeValue()
		Application.addInitializer(application => {
			this.application = application as Application
			this.updateAttributeValue()
			this.changed.subscribe(() => this.updateAttributeValue())
		})
	}

	get calculatedValue() {
		return this.value !== Background.System
			? this.value
			: window.matchMedia('(prefers-color-scheme: dark)').matches
				? Background.Dark
				: Background.Light
	}

	private updateAttributeValue() {
		this.application?.setAttribute('data-theme', this.calculatedValue)
	}
}