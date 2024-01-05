import ColorString from 'color-string'

/**
 * An immutable color class that can be used to represent a color in various formats.
 *
 * @ssr true
 */
export class Color {
	readonly color: ColorString.Color

	constructor(color: string | [r: number, g: number, b: number, a: number]) {
		this.color = color instanceof Array
			? color
			: ColorString.get(color)?.value as ColorString.Color
	}

	get r() { return this.color[0] }
	get g() { return this.color[1] }
	get b() { return this.color[2] }
	get a() { return this.color[3] }

	get hex() { return ColorString.to.hex(this.color) }
	get rgb() { return ColorString.to.rgb(this.color) }
	get rgbPercent() { return ColorString.to.rgb.percent(this.color) }
	get hsl() { return ColorString.to.hsl(this.color) }
	get hsv() { return ColorString.to.hwb(this.color) }
	get keyword() { return ColorString.to.keyword(this.color) }

	toString() { return this.hex }
	valueOf() { return this.hex }
}