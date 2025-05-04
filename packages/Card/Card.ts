import { component, html, property, Component, css, style, unsafeCSS } from '@a11d/lit'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/theme'
import '@3mo/heading'
import '@3mo/flex'

export enum CardType {
	Filled = 'filled',
	Outlined = 'outlined'
}

/**
 * @element mo-card
 *
 * @ssr true
 *
 * @attr type
 * @attr heading
 * @attr subHeading
 * @attr avatar
 * @attr image
 *
 * @slot action - Actions in the header
 * @slot heading - Custom heading in the header
 * @slot subHeading - Custom subHeading in the header
 * @slot avatar - Custom avatar in the header
 * @slot header - The header. Using this will lead to slots 'heading', 'subHeading', 'avatar' and 'action's not working.
 * @slot media - Embedded media
 * @slot - Body / Content
 * @slot footer - Actions in the footer
 *
 * @cssprop --mo-card-header-padding - Padding of the header
 * @cssprop --mo-card-avatar-background - Color of the avatar
 * @cssprop --mo-card-avatar-color - Text color of the avatar
 * @cssprop --mo-card-body-padding - Padding of the body
 * @cssprop --mo-card-footer-padding - Padding of the footer
 *
 * @csspart media - Embedded media
 * @csspart header - The header
 * @csspart avatar - The avatar
 * @csspart heading - The heading
 * @csspart subHeading - The subHeading
 * @csspart footer - The footer
 */
@component('mo-card')
export class Card extends Component {
	@property({ reflect: true }) type = CardType.Filled
	@property() heading?: string
	@property() subHeading?: string
	@property() avatar?: string
	@property() image?: string

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host {
				display: block;
				border-radius: var(--mo-border-radius);
			}

			:host([type=${unsafeCSS(CardType.Filled)}]) {
				background: var(--mo-color-surface);
				box-shadow: var(--mo-shadow);
			}

			:host([type=${unsafeCSS(CardType.Outlined)}]) {
				border: 1px solid var(--mo-color-transparent-gray-3);
			}

			slot[name=media] {
				&[data-empty] { display: none; }
				& > *:first-child, &::slotted(:first-child) {
					border-radius: var(--mo-border-radius) var(--mo-border-radius) 0 0;
					display: block;
					background-size: cover;
					background-repeat: no-repeat;
					background-position: center center;
					width: 100%;
					object-fit: cover;
				}
			}

			slot[name=header] {
				&[data-empty] { display: none; }
				&:not([data-empty]) ~ slot:not([name]) {
					padding: var(--mo-card-body-padding, 0px 16px 16px 16px);
				}
				display: flex;
				align-items: center;
				gap: 6px;
				padding: var(--mo-card-header-padding, 16px);

				slot[name=heading] {
					display: block;
					flex: 1;
				}

				div[part=avatar] {
					height: 40px;
					width: 40px;
					aspect-ratio: 1 / 1;
					display: flex;
					user-select: none;
					justify-content: center;
					align-items: center;
					border-radius: 50%;
					font-size: 18px;
					background: var(--mo-card-avatar-background, var(--mo-color-accent));
					color: var(--mo-card-avatar-color, var(--mo-color-on-accent));
					margin-inline-end: 6px;
				}
			}

			slot:not([name]) {
				&:not([data-empty]) { padding: var(--mo-card-body-padding, 16px); }
				display: block;
				flex: 1;
			}

			slot[name=footer] {
				&[data-empty] { display: none; }
				display: block;
				padding: var(--mo-card-footer-padding, 8px);
			}
		`
	}

	protected override get template() {
		return html`
			<mo-flex ${style({ width: '100%', height: '100%' })}>
				${this.mediaTemplate}
				${this.headerTemplate}
				${this.bodyTemplate}
				${this.footerTemplate}
			</mo-flex>
		`
	}

	protected get mediaTemplate() {
		return html`
			<slot part='media' name='media' ?data-empty=${!this.image && !this.slotController.hasAssignedElements('media')}>
				${!this.image ? html.nothing : html`<img part='media' src=${this.image}>`}
			</slot>
		`
	}

	protected get headerTemplate() {
		const empty = !this.avatar && !this.heading && !this.subHeading
			&& ['header', 'avatar', 'heading', 'subHeading', 'action'].every(slot => !this.slotController.hasAssignedElements(slot))
		return html`
			<slot part='header' name='header' ?data-empty=${empty}>
				${this.defaultHeaderAvatarTemplate}
				<mo-flex justifyContent='space-around' ${style({ flex: '1' })}>
					${this.defaultHeaderHeadingTemplate}
					${this.defaultHeaderSubHeadingTemplate}
				</mo-flex>
				${this.defaultHeaderActionTemplate}
			</slot>
		`
	}

	protected get defaultHeaderAvatarTemplate() {
		return html`
			<slot name='avatar'>
				${!this.avatar ? html.nothing : html`<div part='avatar'>${this.avatar}</div>`}
			</slot>
		`
	}

	protected get defaultHeaderHeadingTemplate() {
		return html`
			<slot name='heading'>
				${!this.heading ? html.nothing : html`
					<mo-heading part='heading' typography='heading4' ${style({ fontWeight: '500' })}>${this.heading}</mo-heading>
				`}
			</slot>
		`
	}

	protected get defaultHeaderSubHeadingTemplate() {
		return html`
			<slot name='subHeading'>
				${!this.subHeading ? html.nothing : html`
					<mo-heading part='subHeading' typography='heading6' ${style({ fontWeight: '400', color: 'rgb(121, 121, 121)' })}>${this.subHeading}</mo-heading>
				`}
			</slot>
		`
	}

	protected get defaultHeaderActionTemplate() {
		return html`<slot name='action'></slot>`
	}

	protected get bodyTemplate() {
		return html`<slot ?data-empty=${!this.slotController.hasAssignedContent('')}></slot>`
	}

	protected get footerTemplate() {
		return html`
			<slot part='footer' name='footer' ?data-empty=${!this.slotController.hasAssignedElements('footer')}></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-card': Card
	}
}