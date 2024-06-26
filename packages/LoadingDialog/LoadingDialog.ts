import { component, css, html, property } from '@a11d/lit'
import { Dialog } from '@3mo/dialog'

/**
 * @element mo-loading-dialog
 *
 * @attr loading
 * @attr loadingHeading
 *
 * @csspart loading
 *
 * @i18n "Loading"
 *
 * @slot loading
 */
@component('mo-loading-dialog')
export class LoadingDialog extends Dialog {
	@property({ type: Boolean }) loading = false
	@property({ type: String }) loadingHeading = t('Loading')

	protected get isLoading() {
		return this.loading
	}

	protected override get dialogHeading() {
		return !this.isLoading
			? super.dialogHeading
			: `${this.loadingHeading} ...`
	}

	static override get styles() {
		return css`
			${super.styles}

			slot[name=loading] {
				display: grid;
				position: absolute;
				inset: 0;
				z-index: 1;
				place-items: center;
			}

			:host(.loading) [part=content] {
				opacity: 0.33;
				pointer-events: none;
				filter: blur(4px);
			}
		`
	}

	protected override get contentTemplate() {
		return html`
			${super.contentTemplate}
			${this.loadingTemplate}
		`
	}

	protected get loadingTemplate() {
		this.classList.toggle('loading', this.isLoading)
		return !this.isLoading ? html.nothing : html`
			<slot slot='content' name='loading' part='loading'>
				<mo-circular-progress></mo-circular-progress>
			</slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-loading-dialog': LoadingDialog
	}
}