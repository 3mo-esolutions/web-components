import { component, css, html, property, nothing, event } from '@a11d/lit'
import { Card } from '@3mo/card'
import { tooltip } from '@3mo/tooltip'
import '@3mo/localization'
import '@3mo/icon-button'

/**
 * @element mo-collapsible-card
 *
 * @attr collapsed
 * @attr disableCollapse
 * @attr showSubHeadingOnlyWhenCollapsed
 *
 * @i18n "Collapse"
 * @i18n "Expand"
 *
 * @fires collapse - Dispatched when the card is collapsed or expanded
 */
@component('mo-collapsible-card')
export class CollapsibleCard extends Card {
	@event() readonly collapse!: EventDispatcher<boolean>

	@property({ type: Boolean, reflect: true }) collapsed = false
	@property({ type: Boolean }) disableCollapse = false
	@property({ type: Boolean }) showSubHeadingOnlyWhenCollapsed = false

	static override get styles() {
		return css`
			${super.styles}

			:host {
				position: relative;
			}

			:host([collapsed]) {
				flex: unset !important;
				height: unset !important;
			}
		`
	}

	protected override get defaultHeaderSubHeadingTemplate() {
		return this.showSubHeadingOnlyWhenCollapsed && !this.collapsed ? nothing : super.defaultHeaderSubHeadingTemplate
	}

	protected override get defaultHeaderActionTemplate() {
		return html`
			${super.defaultHeaderActionTemplate}

			<mo-icon-button dense
				${tooltip(t(this.collapsed ? 'Expand' : 'Collapse'))}
				?disabled=${this.disableCollapse}
				icon=${this.collapsed ? 'expand_more' : 'expand_less'}
				@click=${() => this.toggleCollapse()}
			></mo-icon-button>
		`
	}

	protected override get bodyTemplate() {
		return this.collapsed ? nothing : super.bodyTemplate
	}

	protected toggleCollapse() {
		if (this.disableCollapse === false) {
			this.collapsed = !this.collapsed
			this.collapse.dispatch(this.collapsed)
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-collapsible-card': CollapsibleCard
	}
}