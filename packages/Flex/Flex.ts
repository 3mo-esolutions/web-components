import { component, Component, css, html } from '@a11d/lit'
import { styleProperty } from '@3mo/style-property'
import type * as CSS from 'csstype'
import '@a11d/bidirectional-map'

export type FlexDirection = 'horizontal' | 'vertical' | 'horizontal-reversed' | 'vertical-reversed'

const flexDirectionByDirections = new BidirectionalMap<FlexDirection, string>([
	['horizontal', 'row'],
	['horizontal-reversed', 'row-reverse'],
	['vertical', 'column'],
	['vertical-reversed', 'column-reverse'],
])

const flexDirectionConverter = {
	fromStyle: (value: string) => flexDirectionByDirections.getKey(value) || 'vertical',
	toStyle: (value: FlexDirection) => flexDirectionByDirections.get(value) || 'column',
}

/**
 * @element mo-flex
 *
 * @attr direction
 * @attr wrap
 * @attr gap
 * @attr justifyItems
 * @attr justifyContent
 * @attr alignItems
 * @attr alignContent
 *
 * @slot - The content of the flex container.
 */
@component('mo-flex')
export class Flex extends Component {
	@styleProperty({ styleKey: 'flexDirection', styleConverter: flexDirectionConverter }) direction!: FlexDirection
	@styleProperty({ styleKey: 'flexWrap' }) wrap!: CSS.Property.FlexWrap
	@styleProperty() gap!: CSS.Property.Gap<string>
	@styleProperty() justifyItems!: CSS.Property.JustifyItems
	@styleProperty() justifyContent!: CSS.Property.JustifyContent
	@styleProperty() alignItems!: CSS.Property.AlignItems
	@styleProperty() alignContent!: CSS.Property.AlignContent

	static override get styles() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				flex-wrap: nowrap;
			}
		`
	}

	protected override get template() {
		return html`<slot></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-flex': Flex
	}
}