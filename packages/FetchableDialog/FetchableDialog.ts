import { component, property } from '@a11d/lit'
import { LoadingDialog } from '@3mo/loading-dialog'
import { FetcherController } from '@3mo/fetcher-controller'

/**
 * A dialog that fetches what it shows and stays in its loading state until it arrives.
 *
 * @element mo-fetchable-dialog
 */
@component('mo-fetchable-dialog')
export class FetchableDialog<T> extends LoadingDialog {
	/** Fetches what the dialog shows, again whenever it is replaced. */
	@property({ type: Object }) fetch!: () => T | Promise<T>

	readonly fetcherController = new FetcherController(this, {
		fetch: () => this.fetch(),
		args: () => [this.fetch],
	})

	protected override get isLoading() {
		return this.fetcherController.pending || super.isLoading
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-fetchable-dialog': FetchableDialog<unknown>
	}
}
