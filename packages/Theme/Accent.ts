import { css, isServer, unsafeCSS } from '@a11d/lit'
import { RootCssInjector } from '@a11d/root-css-injector'
import { LocalStorage } from '@a11d/local-storage'
import { Color } from '@3mo/color'

export class AccentStorage extends LocalStorage<Color | undefined> {
	private styleElement?: HTMLStyleElement

	constructor() {
		super('Theme.Accent', new Color('rgb(0, 119, 200)'))
		this.injectCss()
	}

	override get value() {
		const value = super.value

		const color = typeof value === 'object' && value !== null && 'color' in value
			? new Color(value.color as any)
			: undefined

		if (!isServer && !value) {
			window.localStorage.removeItem(this.name)
		}

		return color || this.defaultValue
	}
	override set value(value) {
		super.value = value
		this.injectCss()
	}

	injectCss() {
		this.styleElement = RootCssInjector.inject(
			css`
				:root {
					--mo-color-accent: ${unsafeCSS(this.value?.rgb)};
					--mo-color-on-accent: rgb(${unsafeCSS(this.onAccentColorBase)});
				}
			`,
			this.styleElement
		)
	}

	/* TODO: Replace with @color-contrast when available: https://caniuse.com/mdn-css_types_color_color-contrast */
	private get onAccentColorBase() {
		if (!this.value) {
			return '0 0 0'
		}
		const { r, g, b } = this.value
		const sum = Math.round((r * 299 + g * 587 + b * 114) / 1000)
		return sum > 128 ? '0 0 0' : '255 255 255'
	}
}