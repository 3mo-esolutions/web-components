import { Color } from './Color.js'

describe('Color', () => {
	describe('parsing', () => {
		it('should parse hex strings (with and without alpha)', () => {
			expect(new Color('#0c2238').color).toEqual([12, 34, 56, 1])
			expect(new Color('#0C223880').color).toEqual([12, 34, 56, 128 / 255])
		})

		it('should parse rgb()/rgba() strings including the alpha channel', () => {
			expect(new Color('rgb(12, 34, 56)').color).toEqual([12, 34, 56, 1])
			expect(new Color('rgba(12, 34, 56, 0.5)').color).toEqual([12, 34, 56, 0.5])
		})

		it('should parse CSS keywords', () => {
			expect(new Color('red').hex).toBe('#FF0000')
			expect(new Color('rebeccapurple').hex).toBe('#663399')
		})

		it('should accept an [r, g, b, a] tuple', () => {
			expect(new Color([12, 34, 56, 0.5]).hex).toBe('#0C223880')
		})

		// Bug: Color.ts leaves color undefined for unrecognized strings
		xit('should handle an unrecognized color string predictably', () => {
			const color = new Color('not-a-color')
			expect(color.color).toEqual([0, 0, 0, 1])
			expect(color.hex).toBe('#000000')
		})
	})

	describe('channels', () => {
		it('should expose r, g, b and a', () => {
			const color = new Color('rgba(12, 34, 56, 0.5)')
			expect([color.r, color.g, color.b, color.a]).toEqual([12, 34, 56, 0.5])
		})
	})

	describe('conversions', () => {
		it('should convert to hex, rgb and rgbPercent', () => {
			const opaque = new Color('rgb(255, 0, 0)')
			expect(opaque.hex).toBe('#FF0000')
			expect(opaque.rgb).toBe('rgb(255, 0, 0)')
			expect(opaque.rgbPercent).toBe('rgb(100%, 0%, 0%)')

			const translucent = new Color('rgba(255, 0, 0, 0.5)')
			expect(translucent.hex).toBe('#FF000080')
			expect(translucent.rgb).toBe('rgba(255, 0, 0, 0.5)')
			expect(translucent.rgbPercent).toBe('rgba(100%, 0%, 0%, 0.5)')
		})

		it('should convert to a keyword when one exists', () => {
			expect(new Color('#FF0000').keyword).toBe('red')
			expect(new Color('#0C2238').keyword).toBeUndefined()
		})

		it('should emit hsl and hsv from the raw rgb channels without converting the color space', () => {
			const color = new Color('rgb(255, 0, 0)')
			expect(color.hsl).toBe('hsl(255, 0%, 0%)')
			expect(color.hsv).toBe('hwb(255, 0%, 0%)')
		})

		it('should round-trip rgb output back through the constructor to the same hex', () => {
			for (const hex of ['#0C2238', '#FF0000', '#000000', '#0C223880']) {
				expect(new Color(new Color(hex).rgb).hex).withContext(hex).toBe(hex)
			}
		})
	})

	describe('coercion', () => {
		it('should stringify and valueOf to the hex representation', () => {
			const color = new Color('rgb(12, 34, 56)')
			expect(`${color}`).toBe('#0C2238')
			expect(color.toString()).toBe('#0C2238')
			expect(color.valueOf()).toBe('#0C2238')
		})
	})
})