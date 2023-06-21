import { Controller, ReactiveControllerHost, TemplateResult, html } from '@a11d/lit'

class ToolbarController extends Controller {
	constructor(protected override readonly host: ReactiveControllerHost, protected itemsTemplate: TemplateResult | (() => TemplateResult)) {
		super(host)
	}

	get paneTemplate() {
		return html`
			<mo-flex alignItems='center'>
				${this.itemsTemplate}
			</mo-flex>
		`
	}
}