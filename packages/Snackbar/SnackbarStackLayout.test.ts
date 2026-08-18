import { calculateSnackbarStackLayout, type SnackbarStackLayoutOptions } from './SnackbarStackLayout.js'

describe('calculateSnackbarStackLayout', () => {
	const options: SnackbarStackLayoutOptions = {
		expandedCount: 3,
		peekCount: 2,
		gap: 8,
		peekHeight: 12,
		peekScale: 0.05,
		expanded: false,
	}

	const sizes = (count: number, height = 48) => new Array(count).fill(undefined).map(() => ({ width: 344, height }))

	it('should lay every snack-bar out in full while there are no more than the expanded count', () => {
		const layouts = calculateSnackbarStackLayout(sizes(3), options)

		expect(layouts.map(layout => layout.y)).toEqual([0, -56, -112])
		expect(layouts.every(layout => layout.scale === 1)).toBe(true)
		expect(layouts.every(layout => !layout.size && !layout.hidden)).toBe(true)
	})

	it('should keep the expanded count laid out in full and collapse the rest behind the last of them', () => {
		const layouts = calculateSnackbarStackLayout(sizes(4), options)

		expect(layouts.slice(0, 3).map(layout => layout.y)).toEqual([0, -56, -112])
		expect(layouts.slice(0, 3).every(layout => layout.scale === 1 && !layout.size)).toBe(true)
		// Behind the third one at -112, offset by the peek height plus the height its own shrink eats
		expect(layouts[3]!.y).toBeCloseTo(-(112 + 12 + 48 * 0.05), 10)
		expect(layouts[3]!.scale).toBe(0.95)
		expect(layouts[3]!.hidden).toBe(false)
	})

	it('should clamp collapsed snack-bars to the size of the stack\'s base', () => {
		const layouts = calculateSnackbarStackLayout([
			{ width: 500, height: 70 },
			{ width: 400, height: 60 },
			{ width: 344, height: 48 },
			{ width: 600, height: 90 },
		], options)

		expect(layouts[3]!.size).toEqual({ width: 344, height: 48 })
	})

	it('should let every collapsed snack-bar peek out by the same height regardless of the base\'s height', () => {
		const topEdges = (height: number) => calculateSnackbarStackLayout(sizes(6, height), options)
			.map(layout => -layout.y + height * layout.scale)

		for (const height of [32, 48, 96]) {
			const edges = topEdges(height)
			expect(edges[4]! - edges[3]!).toBeCloseTo(12, 10)
			expect(edges[5]! - edges[4]!).toBeCloseTo(12, 10)
		}
	})

	it('should hide the snack-bars collapsed deeper than the peek count', () => {
		const layouts = calculateSnackbarStackLayout(sizes(7), options)

		expect(layouts.map(layout => layout.hidden)).toEqual([false, false, false, false, false, true, true])
	})

	it('should pile the hidden snack-bars up at the back of the stack instead of letting them drift off', () => {
		const layouts = calculateSnackbarStackLayout(sizes(7), options)

		expect(layouts[6]!.y).toBe(layouts[5]!.y)
		expect(layouts[6]!.scale).toBe(layouts[5]!.scale)
	})

	it('should lay every snack-bar out in full when expanded', () => {
		const layouts = calculateSnackbarStackLayout(sizes(5), { ...options, expanded: true })

		expect(layouts.map(layout => layout.y)).toEqual([0, -56, -112, -168, -224])
		expect(layouts.every(layout => layout.scale === 1 && !layout.size && !layout.hidden)).toBe(true)
	})

	it('should account for differing heights when laying out in full', () => {
		const layouts = calculateSnackbarStackLayout([
			{ width: 344, height: 48 },
			{ width: 344, height: 72 },
			{ width: 344, height: 48 },
		], options)

		expect(layouts.map(layout => layout.y)).toEqual([0, -56, -136])
	})

	it('should handle an empty stack', () => {
		expect(calculateSnackbarStackLayout([], options)).toEqual([])
	})
})