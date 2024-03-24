import { component, property, css } from '@a11d/lit'
import { MdPrimaryTab } from '@material/web/tabs/primary-tab.js'

/**
 * @element mo-tab
 *
 * @attr inlineIcon
 * @attr iconOnly
 *
 * @cssprop --mo-tab-accent
 *
 * @slot - Default slot for tab label
 * @slot icon - Slot for tab icon
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
					--md-primary-tab-focus-label-text-color: var(--mo-color-foreground);
					--md-primary-tab-hover-label-text-color: var(--mo-color-foreground);
					--md-primary-tab-label-text-color: var(--mo-color-foreground);
					--md-primary-tab-pressed-label-text-color: var(--mo-color-foreground);
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