import { css } from '@a11d/lit'
import { RootCssInjector } from '@a11d/root-css-injector'

RootCssInjector.inject(css`
	:root[data-theme=light] {
		color-scheme: light;
		--mo-color-background-base: 255, 255, 255;
		--mo-color-foreground-base: 0, 0, 0;
		--mo-color-background: rgb(220, 221, 225);
		--mo-color-foreground: black;
		--mo-color-foreground-transparent: rgb(48, 48, 48);
		--mo-color-surface-base: 255, 255, 255;
		--mo-color-gray-base: 121, 121, 121;
		--mo-shadow-base: 95, 81, 78;
	}

	:root[data-theme=dark] {
		color-scheme: dark;
		--mo-color-background-base: 0, 0, 0;
		--mo-color-foreground-base: 255, 255, 255;
		--mo-color-background: rgb(16, 17, 20);
		--mo-color-surface-base: 42, 43, 47;
		--mo-color-foreground: white;
		--mo-color-foreground-transparent: rgb(220, 220, 220);
		--mo-color-gray-base: 165, 165, 165;
		--mo-shadow-base: 0, 1, 3;
	}

	:root {
		--mo-font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		--mo-border-radius: 4px;
		/* Shadows */
		--mo-shadow: rgba(var(--mo-shadow-base), .4) 0 1px 2px 0, rgba(var(--mo-shadow-base), .2) 0 1px 3px 1px;
		--mo-shadow-deep: 0px 5px 5px -3px rgba(var(--mo-shadow-base), 0.2), 0px 8px 10px 1px rgba(var(--mo-shadow-base), 0.14), 0px 3px 14px 2px rgba(var(--mo-shadow-base), 0.12);
		/* Colors */
		--mo-color-on-surface: rgba(var(--mo-color-foreground-base), 0.87);
		--mo-color-gray: rgb(var(--mo-color-gray-base));
		--mo-color-gray-transparent: rgba(var(--mo-color-gray-base), 0.5);
		--mo-color-transparent-gray-alpha: .04;
		--mo-color-transparent-gray-1: rgba(var(--mo-color-foreground-base), calc(var(--mo-color-transparent-gray-alpha) * 1)); /* 4% */
		--mo-color-transparent-gray-2: rgba(var(--mo-color-foreground-base), calc(var(--mo-color-transparent-gray-alpha) * 2)); /* 8% */
		--mo-color-transparent-gray-3: rgba(var(--mo-color-foreground-base), calc(var(--mo-color-transparent-gray-alpha) * 3)); /* 12% */
		--mo-color-transparent-gray: var(--mo-color-transparent-gray-1);
		--mo-color-green-base : 93, 170, 96;
		--mo-color-green: rgb(var(--mo-color-green-base));
		--mo-color-yellow-base: 232, 152, 35;
		--mo-color-yellow: rgb(var(--mo-color-yellow-base));
		--mo-color-red-base: 221, 61, 49;
		--mo-color-red: rgb(var(--mo-color-red-base));
		--mo-color-blue-base: 0, 119, 200;
		/* TODO: Replace with @color-contrast when available: https://caniuse.com/mdn-css_types_color_color-contrast */
		/* The solution presented in https://css-tricks.com/css-variables-calc-rgb-enforcing-high-contrast-colors/ doesn't work in Chrome as of late-2023 */
		/* --mo-color-on-accent-base-value: calc(((((var(--mo-color-accent-base-r) * 299) + (var(--mo-color-accent-base-g) * 587) + (var(--mo-color-accent-base-b) * 114)) / 1000) - 128) * -1000); */
		/* --mo-color-on-accent-base: var(--mo-color-on-accent-base-value), var(--mo-color-on-accent-base-value), var(--mo-color-on-accent-base-value); */
		--mo-color-on-accent: rgb(var(--mo-color-on-accent-base));
		--mo-color-accent-base: var(--mo-color-accent-base-r), var(--mo-color-accent-base-g), var(--mo-color-accent-base-b);
		--mo-color-accent: rgb(var(--mo-color-accent-base));
		--mo-color-accent-transparent: rgba(var(--mo-color-accent-base), 0.25);
		--mo-color-accent-gradient: linear-gradient(135deg, rgb(var(--mo-color-accent-gradient-1)), rgb(var(--mo-color-accent-gradient-2)), rgb(var(--mo-color-accent-gradient-3)));
		--mo-color-accent-gradient-transparent: linear-gradient(135deg, rgba(var(--mo-color-accent-gradient-1), 0.25), rgba(var(--mo-color-accent-gradient-2), 0.25), rgba(var(--mo-color-accent-gradient-3), 0.25));
		--mo-color-surface: rgb(var(--mo-color-surface-base));
		/* Override Material Web Components variables */
		--mdc-icon-font: Material Icons Sharp !important;
		--mdc-theme-primary: var(--mo-color-accent) !important;
		--mdc-theme-on-primary: var(--mo-color-on-accent) !important;
		--mdc-theme-secondary: var(--mo-color-accent) !important;
		--mdc-theme-on-secondary: var(--mo-color-on-accent) !important;
		--mdc-theme-text-secondary-on-background: var(--mo-color-gray) !important;
		--mdc-theme-surface: var(--mo-color-surface) !important;
		--mdc-theme-text-primary-on-dark: var(--mo-color-surface) !important;
		--mdc-theme-on-surface: var(--mo-color-foreground-transparent) !important;
		--mdc-theme-text-disabled-on-light: var(--mo-color-gray-transparent) !important;
		--mdc-theme-text-hint-on-background: var(--mo-color-foreground-transparent) !important;
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