import { component, html } from '@a11d/lit'
import { DataGridColumnText, type DataGridColumnMenuItems } from '@3mo/data-grid'

/** A text column in the accent color that adds its own items to the menu under its heading. */
@component('story-address-column')
export class AddressColumn<TData> extends DataGridColumnText<TData> {
	override getContentTemplate(value: string | undefined, data: TData) {
		return html`<span style='color: var(--mo-color-accent)'>${super.getContentTemplate(value, data)}</span>`
	}

	protected override getMenuItemsTemplate(): DataGridColumnMenuItems {
		return new Map([
			['sorting', html`
				<mo-selectable-menu-item icon='my_location' selected>Sort by street</mo-selectable-menu-item>
				<mo-selectable-menu-item icon='location_city'>Sort by zip code</mo-selectable-menu-item>
			`],
			['more', html`
				<mo-menu-item icon='map'>Show on map</mo-menu-item>
			`],
		])
	}
}