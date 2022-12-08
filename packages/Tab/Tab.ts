import { component, property, css } from '@a11d/lit'
import { MaterialIcon } from '@3mo/icon'
import { Tab as MwcTab } from '@material/mwc-tab'

/**
 * @element mo-tab
 *
 * @attr label
 * @attr icon
 * @attr hasImageIcon
 * @attr indicatorIcon
 * @attr isFadingIndicator
 * @attr minWidth
 * @attr isMinWidthIndicator
 * @attr stacked
 * @attr active
 *
 * @cssprop --mo-tab-accent
 */
@component('mo-tab')
export class Tab extends MwcTab {
	@property({ reflect: true }) value!: string
	@property({ reflect: true }) override icon!: MaterialIcon

	static override get styles() {
		return [
			...super.styles,
			css`
				:host {
					--mdc-theme-primary: var(--mo-tab-accent, var(--mo-color-accent, #0077c8));
					--mdc-theme-secondary: var(--mo-tab-accent, var(--mo-color-accent, #0077c8));
					--mdc-tab-color-default: var(--mo-tab-color, var(--mo-color-foreground-transparent, rgb(48, 48, 48)));
					--mdc-tab-text-label-color-default: var(--mo-tab-color, var(--mo-color-foreground-transparent, rgb(48, 48, 48)));
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