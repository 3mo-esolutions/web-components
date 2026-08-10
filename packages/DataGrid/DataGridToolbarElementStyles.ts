import { css, isServer, type CSSResult } from '@a11d/lit'

/**
 * A dynamic registry of size conventions for elements living in a data grid's toolbar or filter areas.
 *
 * Conventions are registered as a plain selector and its declarations, e.g. `set('some-field', css`width: 10rem`)`,
 * and are applied to both slotted elements and default slot content.
 *
 * The underlying style-sheet is shared by reference with every data grid,
 * therefore conventions can be registered at any time and apply to already connected data grids as well.
 */
export class DataGridToolbarElementStyles {
	readonly styleSheet = isServer ? undefined : new CSSStyleSheet()

	private readonly declarationsBySelector = new Map<string, CSSResult>()

	set(selector: string, declarations: CSSResult) {
		this.declarationsBySelector.set(selector, declarations)
		this.styleSheet?.replaceSync([...this.declarationsBySelector]
			.map(([selector, declarations]) => `
				:is(slot[name=toolbar], slot[name=filter])::slotted(:is(${selector})),
				:is(slot[name=toolbar], slot[name=filter]) :is(${selector}) {
					${declarations.cssText}
				}
			`)
			.join('\n'))
	}

	constructor() {
		this.set('[instanceof~=mo-field-text], [instanceof~=mo-field-email], [instanceof~=mo-field-number]', css`max-width: 10rem; flex: 1 1 auto;`)

		this.set('[instanceof~=mo-field-select]', css`max-width: 13rem; flex: 1.3 1 auto;`)
		this.set('[instanceof~=mo-field-select][multiple]', css`max-width: 15rem; flex: 1.5 1 auto;`)

		this.set('[instanceof~=mo-field-date-time]', css`max-width: 13rem; flex: 1.3 1 auto;`)
		this.set('[instanceof~=mo-field-date-time-range]', css`max-width: 15rem; flex: 1.5 1 auto;`)

		this.set('[instanceof~=mo-field-search]', css`max-width: 20rem; flex: 2 1 auto;`)
	}
}