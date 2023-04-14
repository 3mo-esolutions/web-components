import { Color } from '@3mo/color'

export class ColorSet {
	readonly colors = new Array<Color>()

	constructor(...colors: Array<Color | string>) {
		this.colors = colors.map(color => color instanceof Color ? color : new Color(color))
	}

	get medianColor() {
		const color = this.colors[Math.floor(this.colors.length / 2)]
		if (!color) {
			throw new Error('No colors found')
		}
		return color
	}
}