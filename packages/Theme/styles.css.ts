import { css, unsafeCSS } from '@a11d/lit'
import { RootCssInjector } from '@a11d/root-css-injector'
import { colorContrast } from './colorContrast.js'

type SchemeParameters = {
	/** The oklch lightness in percent the seed's lightness gets re-pinned to, which is roughly interchangeable with an M3 "tone" via `oklch lightness ≈ (tone + 16) / 116 * 100%`. */
	lightness: number
	/** The maximum oklch chroma, usually the sRGB gamut ceiling at the role's tone. Capping instead of re-pinning lets deliberately muted seed colors stay muted. */
	maximumChroma: number
}

/**
 * Derives a color-scheme-adaptive color from a seed color à la Material Design 3's tonal color roles:
 * The seed's exact hue is preserved, while its lightness is re-pinned per color scheme
 * and its chroma is capped to the given maximum.
 *
 * @param seed A CSS color expression e.g. `var(--mo-color-accent-seed)` or `rgb(0, 119, 200)`.
 * @param parameters The lightness and maximum chroma per color scheme.
 *
 * @example deriveColor('var(--mo-color-accent-seed)', { light: { lightness: 48, maximumChroma: .135 }, dark: { lightness: 83.5, maximumChroma: .085 } })
 */
function deriveColor(seed: string, parameters: { light: SchemeParameters, dark: SchemeParameters }) {
	const branch = ({ lightness, maximumChroma }: SchemeParameters) => `oklch(from ${seed} ${lightness}% min(c, ${maximumChroma}) h)`
	return unsafeCSS(`light-dark(${branch(parameters.light)}, ${branch(parameters.dark)})`)
}

RootCssInjector.inject(css`
	/* Has to stay at the top level, as "@property" is not a nestable at-rule and gets dropped inside of a style rule */
	@property --mo-color-accent-seed {
		syntax: '<color>';
		inherits: true;
		initial-value: rgb(0, 119, 200);
	}

	:root {
		--mo-color-on-accent-seed: ${colorContrast('var(--mo-color-accent-seed)')};

		--mo-color-foreground: light-dark(black, white);
		--mo-color-background: light-dark(
			color-mix(in srgb, rgb(220, 220, 220), var(--mo-color-accent-seed) var(--mo-color-background-leak-percent, 14%)),
			color-mix(in srgb, rgb(12, 13, 17), var(--mo-color-accent-seed) var(--mo-color-background-leak-percent, 4%))
		);
		--mo-color-gray: light-dark(rgb(121, 121, 121), rgb(165, 165, 165));
		--mo-color-surface: light-dark(
			color-mix(in srgb, white, var(--mo-color-accent-seed) var(--mo-color-surface-leak-percent, 6%)),
			color-mix(in srgb, rgb(27, 28, 32), var(--mo-color-accent-seed) var(--mo-color-surface-leak-percent, 8%))
		);
		--mo-color-surface-container-lowest: light-dark(
			var(--mo-color-surface),
			color-mix(in srgb, var(--mo-color-surface) 100%, black 64%)
		);
		--mo-color-surface-container-low: light-dark(
			var(--mo-color-surface),
			color-mix(in srgb, var(--mo-color-surface) 100%, black 32%)
		);
		--mo-color-surface-container: var(--mo-color-surface);
		--mo-shadow-base: light-dark(rgb(95, 81, 78), rgb(0, 1, 3));


		--mo-font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		--mo-font-family-mono: ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', 'SF Mono', Menlo, Consolas, 'Roboto Mono', 'DejaVu Sans Mono', monospace;
		--mo-border-radius: 4px;

		/* Shadows */
		--mo-shadow: color-mix(in srgb, var(--mo-shadow-base) 40%, transparent) 0 1px 2px 0, color-mix(in srgb, var(--mo-shadow-base) 20%, transparent) 0 1px 3px 1px;
		--mo-shadow-deep: 0px 5px 5px -3px color-mix(in srgb, var(--mo-shadow-base) 20%, transparent), 0px 8px 10px 1px color-mix(in srgb, var(--mo-shadow-base) 14%, transparent), 0px 3px 14px 2px color-mix(in srgb, var(--mo-shadow-base) 12%, transparent);

		/* Colors */
		--mo-color-on-surface: color-mix(in srgb, var(--mo-color-foreground), transparent 13%);
		--mo-color-gray-transparent: color-mix(in srgb, var(--mo-color-gray), transparent 50%);
		--mo-color-transparent-gray-alpha: 4%;
		--mo-color-transparent-gray-1: color-mix(in srgb, var(--mo-color-foreground), transparent calc(100% - var(--mo-color-transparent-gray-alpha) * 1)); /* 4% */
		--mo-color-transparent-gray-2: color-mix(in srgb, var(--mo-color-foreground), transparent calc(100% - var(--mo-color-transparent-gray-alpha) * 2)); /* 8% */
		--mo-color-transparent-gray-3: color-mix(in srgb, var(--mo-color-foreground), transparent calc(100% - var(--mo-color-transparent-gray-alpha) * 3)); /* 12% */
		--mo-color-transparent-gray: var(--mo-color-transparent-gray-1);
		--mo-color-scrim: light-dark(rgb(0 0 0 / 0.32), rgb(0 0 0 / 0.5));
		--mo-color-surface-container-high: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-foreground) 4%);
		--mo-color-surface-container-highest: color-mix(in srgb, var(--mo-color-surface), var(--mo-color-foreground) 8%);
		--mo-color-green: rgb(93, 170, 96);
		--mo-color-yellow: rgb(232, 152, 35);
		--mo-color-red: rgb(221, 61, 49);
		--mo-color-blue: rgb(0, 119, 200);
		/*
			Simulation of Material Design 3's color scheme derivation from a "seed" color, which itself is never used directly anywhere.
			@see https://github.com/material-foundation/material-color-utilities

			The color roles are re-derived from the seed in the "oklch" color space, preserving its exact hue,
			pinning the lightness to the M3 tone (i.e. CIE lightness) assigned to each role per scheme,
			and capping the chroma to M3's gamut-clamped palette values at the respective tone
			- capping instead of re-pinning, so that deliberately muted brand colors stay muted:

			Role                          | Light theme       | Dark theme
			------------------------------|-------------------|------------------
			accent (M3 "primary")         | tone 40 ≈ 48%     | tone 80 ≈ 83.5%
			on-accent                     | tone 100 = white  | tone 20 ≈ 31%
			accent-container              | tone 90 ≈ 91%     | tone 30 ≈ 40%
			on-accent-container           | tone 30 ≈ 40%     | tone 90 ≈ 91%

			Use the solid accent for small high-emphasis elements (e.g. filled buttons, selection controls, indicators),
			and the container pair for medium-emphasis fills where the solid accent would be too loud
			(e.g. tonal buttons, selected-state backgrounds, or avatars).
			*/
		--mo-color-accent: var(--mo-color-accent-seed);
		--mo-color-on-accent: var(--mo-color-on-accent-seed);
		--mo-color-accent-container: ${deriveColor('var(--mo-color-accent)', { light: { lightness: 91, maximumChroma: .05 }, dark: { lightness: 40, maximumChroma: .085 } })};
		--mo-color-on-accent-container: ${deriveColor('var(--mo-color-accent)', { light: { lightness: 40, maximumChroma: .085 }, dark: { lightness: 91, maximumChroma: .05 } })};

		--mo-color-accent-transparent: color-mix(in srgb, var(--mo-color-accent), transparent 75%);

		/* Override Material Web Components variables */
		--mdc-icon-font: Material Icons Sharp !important;
		--mdc-theme-primary: var(--mo-color-accent) !important;
		--mdc-theme-on-primary: var(--mo-color-on-accent) !important;
		--mdc-theme-secondary: var(--mo-color-accent) !important;
		--mdc-theme-on-secondary: var(--mo-color-on-accent) !important;
		--mdc-theme-text-secondary-on-background: var(--mo-color-gray) !important;
		--mdc-theme-surface: var(--mo-color-surface) !important;
		--mdc-theme-text-primary-on-dark: var(--mo-color-surface) !important;
		--mdc-theme-on-surface: color-mix(in srgb, var(--mo-color-foreground), transparent 16%) !important;
		--mdc-theme-text-disabled-on-light: var(--mo-color-gray-transparent) !important;
		--mdc-theme-text-hint-on-background: color-mix(in srgb, var(--mo-color-foreground), transparent 16%) !important;
		--mdc-theme-text-icon-on-background: var(--mo-color-gray) !important;
		--mdc-theme-text-primary-on-background: var(--mo-color-foreground) !important;
		/* Override Material Design variables */
		--md-sys-color-primary: var(--mo-color-accent);
		--md-sys-color-primary-container: var(--mo-color-accent-transparent);
		--md-sys-color-secondary: var(--mo-color-accent);
		--md-sys-color-secondary-container: var(--mo-color-accent-transparent);
		--md-sys-color-surface: var(--mo-color-surface);
		--md-sys-color-surface-container: var(--mo-color-accent);
		/* --md-sys-color-on-primary: var(--mo-color-on-accent);
		--md-sys-color-primary-container: var(--mo-color-accent-container);
		--md-sys-color-on-primary-container: var(--mo-color-on-accent-container);
		--md-sys-color-secondary: var(--mo-color-accent);
		--md-sys-color-on-secondary: var(--mo-color-on-accent);
		--md-sys-color-secondary-container: var(--mo-color-accent-container);
		--md-sys-color-on-secondary-container: var(--mo-color-on-accent-container);
		--md-sys-color-surface: var(--mo-color-surface);
		--md-sys-color-surface-container: var(--mo-color-surface-container); */
		--md-sys-color-on-surface: var(--mo-color-on-surface);
		--md-sys-color-on-surface-variant: var(--mo-color-on-surface);
	}
`)