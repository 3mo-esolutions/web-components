/** The measured size of a snack-bar in pixels. */
export type SnackbarStackItemSize = {
	readonly width: number
	readonly height: number
}

export type SnackbarStackLayoutOptions = {
	/** How many snack-bars are laid out in full before the rest collapse behind the last of them. */
	readonly expandedCount: number
	/** How many collapsed snack-bars peek out behind the stack's base before the rest are hidden. */
	readonly peekCount: number
	/** The space between two snack-bars laid out in full. */
	readonly gap: number
	/** How far a collapsed snack-bar peeks out behind the one in front of it. */
	readonly peekHeight: number
	/** How much smaller a collapsed snack-bar is than the one in front of it, as a fraction of the stack's base. */
	readonly peekScale: number
	/** Lays every snack-bar out in full, regardless of {@link expandedCount}. */
	readonly expanded: boolean
}

/** Where a single snack-bar sits in the stack. */
export type SnackbarStackItemLayout = {
	/** The offset along the axis the stack grows in, negative because it grows away from the anchored edge. */
	readonly y: number
	readonly scale: number
	/** Collapsed so deep that it is not part of the visible stack anymore. It keeps its place so that it animates in from the right position once the ones in front of it are gone. */
	readonly hidden: boolean
	/** Set on collapsed snack-bars only, which are clamped to the size of the stack's base so that the pile's edges align. */
	readonly size?: SnackbarStackItemSize
}

/**
 * Positions a set of open snack-bars, given their natural sizes ordered front to back — the front-most
 * being the newest one, which sits at the anchored edge and is always laid out in full.
 *
 * The first `expandedCount` snack-bars are laid out as a plain list, each one offset past the one in
 * front of it. Everything after them collapses into a pile behind the LAST of them, the stack's base:
 * the list never grows past a fixed number of snack-bars, so a burst of notifications cannot walk up
 * the whole screen, while the ones that are still worth reading stay readable. Hovering or focusing the
 * stack sets {@link SnackbarStackLayoutOptions.expanded}, which lays every snack-bar out in full again.
 *
 * A collapsed snack-bar is clamped to the base's size and scaled down about its bottom edge, so it
 * loses `height * peekScale` of its own height per step. Offsetting it by `peekHeight` alone would
 * therefore leave its top edge short of the one in front of it and hide it completely — the shrink has
 * to be added back on top, which is what keeps every snack-bar peeking out by the same `peekHeight`
 * however tall the stack's base happens to be.
 */
export function calculateSnackbarStackLayout(sizes: ReadonlyArray<SnackbarStackItemSize>, options: SnackbarStackLayoutOptions): Array<SnackbarStackItemLayout> {
	const expandedCount = options.expanded ? sizes.length : Math.max(options.expandedCount, 1)
	const baseIndex = Math.min(expandedCount, sizes.length) - 1
	const baseSize = sizes[baseIndex]
	const step = !baseSize ? 0 : options.peekHeight + baseSize.height * options.peekScale

	// The stack grows away from the anchored edge, and a distance of none is no offset rather than a negative one
	const offsetOf = (distance: number) => distance === 0 ? 0 : -distance

	const layouts = new Array<SnackbarStackItemLayout>()
	let offset = 0
	let baseOffset = 0

	for (const [index, size] of sizes.entries()) {
		if (index <= baseIndex) {
			baseOffset = offset
			layouts.push({ y: offsetOf(offset), scale: 1, hidden: false })
			offset += size.height + options.gap
		} else {
			const depth = index - baseIndex
			// Clamped so that the hidden ones pile up at the back of the stack instead of drifting off-screen
			const visibleDepth = Math.min(depth, options.peekCount + 1)
			layouts.push({
				y: offsetOf(baseOffset + step * visibleDepth),
				scale: Math.max(1 - options.peekScale * visibleDepth, 0),
				hidden: depth > options.peekCount,
				size: baseSize,
			})
		}
	}

	return layouts
}