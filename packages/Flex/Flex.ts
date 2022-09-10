import { component, Component, property, css, html } from '@a11d/lit'
import type * as CSS from 'csstype'

export type FlexDirection = 'horizontal' | 'vertical' | 'horizontal-reversed' | 'vertical-reversed'

/**
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
	private static readonly flexDirectionByDirections = new Map<FlexDirection, string>([
		['horizontal', 'row'],
		['horizontal-reversed', 'row-reverse'],
		['vertical', 'column'],
		['vertical-reversed', 'column-reverse'],
	])

	@property()
	get direction() { return [...Flex.flexDirectionByDirections].find(([, flexDirection]) => this.style.flexDirection === flexDirection)?.[0] || 'vertical' }
	set direction(value) { this.style.flexDirection = Flex.flexDirectionByDirections.get(value) || 'column' }

	@property()
	get wrap() { return this.style.flexWrap as CSS.Property.FlexWrap }
	set wrap(value) { this.style.flexWrap = value }

	@property()
	get gap() { return this.style.gap as CSS.Property.Gap<string> }
	set gap(value) { this.style.gap = value }

	@property()
	get justifyItems() { return this.style.justifyItems as CSS.Property.JustifyItems }
	set justifyItems(value) { this.style.justifyItems = value }

	@property()
	get justifyContent() { return this.style.justifyContent as CSS.Property.JustifyContent }
	set justifyContent(value) { this.style.justifyContent = value }

	@property()
	get alignItems() { return this.style.alignItems as CSS.Property.AlignItems }
	set alignItems(value) { this.style.alignItems = value }

	@property()
	get alignContent() { return this.style.alignContent as CSS.Property.AlignContent }
	set alignContent(value) { this.style.alignContent = value }

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