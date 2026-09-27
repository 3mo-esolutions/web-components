import { component, property, css } from '@a11d/lit'
import { MdPrimaryTab } from '@material/web/tabs/primary-tab.js'

/**
 * A tab of a tab bar, with a label and an optional icon.
 *
 * @element mo-tab
 *
 * @attr value - Identifies the tab in the `value` of its bar, and pairs it with the panel of the same value
 * @attr inline-icon - Places the icon beside the label instead of above it
 * @attr icon-only - Marks a tab without a label during server-side rendering; detected on its own otherwise
 *
 * @cssprop --mo-tab-accent-color - The color of the active tab and its indicator
 * @cssprop --mo-tab-background-color - The background of the tab
 *
 * @slot - The label
 * @slot icon - The icon
 */
@component('mo-tab')
export class Tab extends MdPrimaryTab {
	@property({ reflect: true }) value!: string

	static override get styles() {
		return [
			...super.styles,
			css`
				:host {
					height: 100%;

					--md-primary-tab-active-indicator-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-indicator-shape: var(--mo-border-radius) var(--mo-border-radius) 0px 0px;
					--md-primary-tab-active-hover-state-layer-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-pressed-state-layer-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-container-color: var(--mo-tab-background-color, transparent);
					--md-primary-tab-container-height: auto;
					--md-primary-tab-pressed-state-layer-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-focus-icon-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-hover-icon-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-icon-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-pressed-icon-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-focus-label-text-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-hover-label-text-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-label-text-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-active-pressed-label-text-color: var(--mo-tab-accent-color, var(--mo-color-accent));
					--md-primary-tab-focus-label-text-color: currentColor;
					--md-primary-tab-hover-label-text-color: currentColor;
					--md-primary-tab-label-text-color: currentColor;
					--md-primary-tab-pressed-label-text-color: currentColor;
					--md-focus-ring-color: var(--mo-tab-accent-color, var(--mo-color-accent));
				}

				.content {
					height: 100%;
					min-height: 40px;
				}

				.button {
					height: 100%;
				}
			`
		]
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-tab': Tab
	}
}