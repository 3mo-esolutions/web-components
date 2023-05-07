import { PopoverHostedAlignment, PopoverHostedPlacement } from '@3mo/popover/PopoverHost.js'
import { Component, component, html, property } from '@a11d/lit'

@component('mo-list-submenu')
export class Submenu extends Component {
	@property() menuPlacement = PopoverHostedPlacement.InlineEnd
	@property() menuAlignment = PopoverHostedAlignment.Start

	protected override get template() {
		return html`
			<mo-popover-host placement=${this.menuPlacement} alignment=${this.menuAlignment} style='display: flex'>
				<mo-list-item style='display: flex; flex: 1'>
					<mo-flex style='flex-flow: row; flex: 1; align-items: center'>
						<slot name='origin'></slot>
					</mo-flex>
					<mo-icon icon='chevron_right'></mo-icon>
				</mo-list-item>
				<mo-menu slot='popover'>
					<slot></slot>
				</mo-menu>
			</mo-popover-host>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-list-submenu': Submenu
	}
}