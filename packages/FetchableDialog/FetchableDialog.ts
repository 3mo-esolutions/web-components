import { component, property } from '@a11d/lit'
import { LoadingDialog } from '@3mo/loading-dialog'
import { FetcherController } from '@3mo/fetcher-controller'

@component('mo-fetchable-dialog')
export class FetchableDialog<T> extends LoadingDialog {
	@property({ type: Object }) fetch!: () => T | Promise<T>

	readonly fetcherController = new FetcherController(this, {
		fetch: () => this.fetch(),
		args: () => [this.fetch]
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