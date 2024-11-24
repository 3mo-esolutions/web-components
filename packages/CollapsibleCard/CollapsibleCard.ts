import { component, css, html, property, event } from '@a11d/lit'
import { Card } from '@3mo/card'
import { tooltip } from '@3mo/tooltip'

/**
 * @element mo-collapsible-card
 *
 * @ssr true
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

	@property({ type: Boolean, reflect: true, event: 'collapse' }) collapsed = false
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
		return this.showSubHeadingOnlyWhenCollapsed && !this.collapsed ? html.nothing : super.defaultHeaderSubHeadingTemplate
	}

	protected override get defaultHeaderActionTemplate() {
		return html`
			${super.defaultHeaderActionTemplate}

			<mo-expand-collapse-icon-button
				${tooltip(this.collapsed ? t('Expand') : t('Collapse'))}
				?disabled=${this.disableCollapse}
				?open=${!this.collapsed}
				@click=${() => this.toggleCollapse()}
			></mo-expand-collapse-icon-button>
		`
	}

	protected override get bodyTemplate() {
		return this.collapsed ? html.nothing : super.bodyTemplate
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