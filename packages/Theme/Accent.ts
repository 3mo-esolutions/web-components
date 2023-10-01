import { css, unsafeCSS } from '@a11d/lit'
import { RootCssInjector } from '@a11d/root-css-injector'
import { LocalStorage } from '@a11d/local-storage'
import { Color } from '@3mo/color'
import { ColorSet } from './ColorSet.js'

export class AccentStorage extends LocalStorage<Color | ColorSet | undefined> {
	private styleElement?: HTMLStyleElement

	constructor() {
		super('Theme.Accent', new Color('rgb(0, 119, 200)'))
		this.injectCss()
	}

	override get value() {
		let value = super.value

		value = this.parseColor(value) || this.parseColorSet(value)

		if (!value) {
			window.localStorage.removeItem(this.name)
		}

		return value || this.defaultValue
	}
	override set value(value) {
		(value as any)['$type'] = value instanceof ColorSet ? 'ColorSet' : 'Color'
		super.value = value
		this.injectCss()
	}

	private parseColor = (value: unknown) => {
		if (typeof value === 'object' && value !== null && '$type' in value && value.$type === 'Color' && 'color' in value) {
			return new Color(value.color as any)
		}
		return undefined
	}

	private parseColorSet = (value: unknown) => {
		if (typeof value === 'object' && value !== null && '$type' in value && value.$type === 'ColorSet' && 'colors' in value) {
			return new ColorSet(...(value.colors as Array<unknown>).map(c => (c as any).color as any))
		}
		return undefined
	}

	get medianColor() {
		return this.value instanceof ColorSet ? this.value.medianColor : this.value
	}

	injectCss() {
		const value = this.value
		const medianColor = this.medianColor
		const firstColor = value instanceof ColorSet ? value.colors[0] : value
		const secondColor = value instanceof ColorSet ? value.colors[1] : value
		const thirdColor = value instanceof ColorSet ? value.colors[2] : value
		this.styleElement = RootCssInjector.inject(
			css`
				:root {
					--mo-color-accent-base-r:${unsafeCSS(medianColor?.r)};
					--mo-color-accent-base-g:${unsafeCSS(medianColor?.g)};
					--mo-color-accent-base-b:${unsafeCSS(medianColor?.b)};
					--mo-color-accent-gradient-1: ${unsafeCSS(firstColor?.rgb)};
					--mo-color-accent-gradient-2: ${unsafeCSS(secondColor?.rgb)};
					--mo-color-accent-gradient-3: ${unsafeCSS(thirdColor?.rgb)};
					--mo-color-on-accent-base: ${unsafeCSS(this.onAccentColorBase)};
				}
			`,
			this.styleElement
		)
	}

	private get onAccentColorBase() {
		if (!this.medianColor) {
			return '0 0 0'
		}
		const { r, g, b } = this.medianColor
		const sum = Math.round((r * 299 + g * 587 + b * 114) / 1000)
		return sum > 128 ? '0 0 0' : '255 255 255'
	}
}