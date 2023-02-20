import { component, css, html, property, nothing } from '@a11d/lit'
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
				inset: 50px 0 0 0;
				z-index: 1;
				place-items: center;
				backdrop-filter: blur(5px);
				background: rgba(var(--mo-color-surface-base),0.5);
			}
		`
	}

	protected override get contentSlotTemplate() {
		return html`
			${super.contentSlotTemplate}
			${this.loadingTemplate}
		`
	}

	protected get loadingTemplate() {
		return !this.isLoading ? nothing : html`
			<slot name='loading' part='loading'>
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