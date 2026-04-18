import { unsafeCSS } from '@a11d/lit'

type Color =
	| 'background'
	| 'surface'
	| 'surface-container-lowest'
	| 'surface-container-low'
	| 'surface-container'
	| 'surface-container-high'
	| 'surface-container-highest'

/**
 * Generates a CSS color that shifts the lightness of the given surface color
 * by a perceptually uniform step in oklch color space.
 *
 * The direction is automatic — lighter on dark surfaces, darker on light surfaces.
 *
 * @param color - A CSS color value or variable reference. Defaults to `var(--mo-color-surface)`.
 * @param step - Lightness shift magnitude. Defaults to 1.
 */
export function surfaceElevation(color: Color = 'surface', step = 1) {
	return unsafeCSS(`oklch(from var(--mo-color-${color}) calc(l + (1 - 2 * round(l, 1)) * ${step * 0.03}) c h)`)
}