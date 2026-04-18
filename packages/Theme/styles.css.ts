import { css } from '@a11d/lit'
import { RootCssInjector } from '@a11d/root-css-injector'
import { colorContrast } from './colorContrast.js'
import { surfaceElevation } from './surfaceElevation.js'

RootCssInjector.inject(css`
	:root {
		--mo-shadow-base: light-dark(rgb(95, 81, 78), rgb(0, 1, 3));


		--mo-font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
		--mo-color-foreground: light-dark(black, white);
		--mo-color-background: light-dark(
			color-mix(in srgb, rgb(220, 220, 220), var(--mo-color-accent) var(--mo-color-background-leak-percent, 14%)),
			color-mix(in srgb, rgb(12, 13, 17), var(--mo-color-accent) var(--mo-color-background-leak-percent, 4%))
		);
		--mo-color-gray: light-dark(rgb(121, 121, 121), rgb(165, 165, 165));

		--mo-color-surface-container: light-dark(
			color-mix(in srgb, white, var(--mo-color-accent) var(--mo-color-surface-leak-percent, 6%)),
			color-mix(in srgb, rgb(27, 28, 32), var(--mo-color-accent) var(--mo-color-surface-leak-percent, 8%))
		);
		--mo-color-surface: var(--mo-color-surface-container);
		--mo-color-surface-container-lowest: ${surfaceElevation('surface-container', -2)};
		--mo-color-surface-container-low: ${surfaceElevation('surface-container', -1)};
		--mo-color-surface-container-high: ${surfaceElevation('surface-container', 1)};
		--mo-color-surface-container-highest: ${surfaceElevation('surface-container', 2)};
		--mo-color-green: rgb(93, 170, 96);
		--mo-color-yellow: rgb(232, 152, 35);
		--mo-color-red: rgb(221, 61, 49);
		--mo-color-blue: rgb(0, 119, 200);
		--mo-color-accent-transparent: color-mix(in srgb, var(--mo-color-accent), transparent 75%);
		--mo-color-on-accent: ${colorContrast('var(--mo-color-accent)')};

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
		--md-sys-color-on-surface: var(--mo-color-on-surface);
		--md-sys-color-on-surface-variant: var(--mo-color-on-surface);
	}
`)