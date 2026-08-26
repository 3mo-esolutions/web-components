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
 * @cssprop --mo-collapsible-card-transition-duration - The duration of the collapse and expand animation. Set to "0s" to opt out, e.g. when the collapsed state drives the layout of another element which cannot follow along.
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
				interpolate-size: allow-keywords;
			}

			:host([collapsed]) {
				flex: unset !important;
				height: unset !important;
			}

			slot:not([name]) {
				/* "clip" instead of "hidden", so that sticky content stays anchored to the scroller it is in. */
				overflow: clip;
				transition-property: height, padding-block, opacity, flex-grow, content-visibility;
				transition-duration: var(--mo-collapsible-card-transition-duration, var(--mo-duration-quick, 250ms));
				transition-timing-function: ease;
				transition-behavior: allow-discrete;
			}

			/*
				"padding-block" as a longhand, so that the horizontal part of "--mo-card-body-padding" stays untouched,
				"flex-grow" as a card of a given height would otherwise re-grow the body to whatever the height gives up, and
				"content-visibility" as its discrete transition animates in both directions without a "@starting-style"
				- which would animate every card open on first paint - while also taking the collapsed body
				out of the focus order, the accessibility tree and any intrinsic size of the card.
			*/
			:host([collapsed]) slot:not([name]) {
				height: 0;
				padding-block: 0;
				opacity: 0;
				flex-grow: 0;
				content-visibility: hidden;
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