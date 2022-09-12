import { component, css, Component, html, property, eventListener, ifDefined } from '@a11d/lit'

export const enum AnchorSpecialTarget {
	/** the current browsing context. (Default) */
	Self = '_self',
	/** Usually a new tab, but users can configure browsers to open a new window instead. */
	Blank = '_blank',
	/** The parent browsing context of the current one. If no parent, behaves as "_self" */
	Parent = '_parent',
	/** The topmost browsing context (the "highest" context that's an ancestor of the current one). If no ancestors, behaves as "_self". */
	Top = '_top',
}

export const enum AnchorReferrerPolicy {
	/** The Referer header will be omitted entirely. No referrer information is sent along with requests. */
	NoReferrer = 'no-referrer',
	/** The URL is sent as a referrer when the protocol security level stays the same (e.g.HTTP→HTTP, HTTPS→HTTPS), but isn't sent to a less secure destination (e.g. HTTPS→HTTP). */
	NoReferrerWhenDowngrade = 'no-referrer-when-downgrade',
	/** Only send the origin of the document as the referrer in all cases. The document https://example.com/page.html will send the referrer https://example.com/. */
	Origin = 'origin',
	/** Send a full URL when performing a same-origin request, but only send the origin of the document for other cases. */
	OriginWhenCrossOrigin = 'origin-when-cross-origin',
	/** A referrer will be sent for same-site origins, but cross-origin requests will contain no referrer information. */
	SameOrigin = 'same-origin',
	/** Only send the origin of the document as the referrer when the protocol security level stays the same (e.g. HTTPS→HTTPS), but don't send it to a less secure destination (e.g. HTTPS→HTTP). */
	StrictOrigin = 'strict-origin',
	/** This is the user agent's default behavior if no policy is specified. Send a full URL when performing a same-origin request, only send the origin when the protocol security level stays the same (e.g. HTTPS→HTTPS), and send no header to a less secure destination (e.g. HTTPS→HTTP). */
	StrictOriginWhenCrossOrigin = 'strict-origin-when-cross-origin',
	/** Send a full URL when performing a same-origin or cross-origin request. This policy will leak origins and paths from TLS-protected resources to insecure origins. Carefully consider the impact of this setting. */
	UnsafeUrl = 'unsafe-url',
}

/**
 * @attr href
 * @attr target
 * @attr target
 * @attr download
 * @attr ping
 * @attr referrerPolicy
 * @attr rel
 *
 * @slot - The content of the anchor
 */
@component('mo-anchor')
export class Anchor extends Component {
	private static readonly voidHref = ''

	@property() href = Anchor.voidHref
	@property() target?: AnchorSpecialTarget | (string & {})
	@property() download?: string
	@property() ping?: string
	@property() referrerPolicy?: string
	@property() rel?: string

	@eventListener('click')
	protected handleClick(e: PointerEvent) {
		if (this.href === Anchor.voidHref) {
			e.preventDefault()
		}
	}

	@eventListener('auxclick')
	protected handleAuxiliaryClick(e: PointerEvent) {
		if (this.href === Anchor.voidHref) {
			e.preventDefault()
			const EventConstructor = e.constructor as Constructor<Event>
			this.dispatchEvent(new EventConstructor('click', e))
		}
	}

	static override get styles() {
		return css`
			a { color: var(--mo-anchor-color, var(--mo-color-accent, #0077c8)); }
		`
	}

	protected override get template() {
		return html`
			<a href=${this.href}
				target=${ifDefined(this.target)}
				download=${ifDefined(this.download)}
				ping=${ifDefined(this.ping)}
				referrerPolicy=${ifDefined(this.referrerPolicy)}
				rel=${ifDefined(this.rel)}
			><slot></slot></a>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-anchor': Anchor
	}
}