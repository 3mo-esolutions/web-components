import { Component, component, css, event, eventListener, html, ifDefined, literal, property, query, staticHtml } from '@a11d/lit'
import { disabledProperty } from '@3mo/disabled-property'
import { SlotController } from '@3mo/slot-controller'
import { Localizer } from '@3mo/localization'
import { SelectionGroupPattern } from '@3mo/selection-group'
import '@3mo/icon'
import '@3mo/theme'
import '@3mo/focus-ring'
import '@material/web/ripple/ripple.js'

Localizer.dictionaries.add('de', {
	'Remove ${label:string}': '${label} entfernen',
})

/**
 * A compact element representing an attribute, a selection, an entry the user made, or an action
 * contextual to what is on screen. Chips belong in a set — see `mo-chip-group`.
 *
 * The chip is one button — a native `<button>`, an `<a>` when `href` is given, an inert `<span>` when
 * `readonly` — and `start` and `end` are graphics inside it. The only things beside it are the remove
 * button and whatever a consumer puts in `action`, so pressing either never activates the chip.
 *
 * @element mo-chip
 *
 * @ssr true
 *
 * @attr value - Identifies the chip within a `mo-chip-group`.
 * @attr selectable - Makes the chip a toggle, announced as a pressed-state button.
 * @attr selected - Whether the chip is selected. Only meaningful while `selectable`.
 * @attr removable - Renders the remove button and enables removal via Backspace and Delete.
 * @attr readonly - Renders a plain tag: not focusable, no state layer, no activation.
 * @attr disabled - Disables the chip and its remove button.
 * @attr href - Renders the primary action as a link.
 * @attr target - The link target, with `href`.
 *
 * @slot - The chip's label.
 * @slot start - A graphic at the start, INSIDE the button. Replaced by the checkmark while selected.
 * @slot end - A graphic at the end, INSIDE the button — the pair of `start`. Part of it, so the state layer covers it.
 * @slot action - A control of your own — the one thing placed OUTSIDE the chip's button, so that pressing it is not pressing the chip. A graphic belongs in `start` or `end`.
 *
 * @csspart button - The chip's button.
 * @csspart label - The label wrapper.
 * @csspart remove - The remove button.
 *
 * @i18n "Remove ${label:string}"
 *
 * @fires requestSelect - Dispatched with the state the chip would take, before it takes it. Cancelable: a group prevents it and rules instead.
 * @fires change - Dispatched with the new state when the user toggles a selectable chip.
 * @fires requestRemove - Dispatched before the chip is removed. Cancelable. The chip never removes itself.
 */
@component('mo-chip')
export class Chip extends Component {
	static override shadowRootOptions: ShadowRootInit = { ...Component.shadowRootOptions, delegatesFocus: true }

	@event({ bubbles: true }) readonly change!: EventDispatcher<boolean>

	@property() value?: string
	@property({ type: Boolean }) selectable = false
	// The one state that reflects, because it is the only one the outside styles: `:host([selected])`
	// paints the host itself, which no stamp on a descendant can reach, and `mo-chip[selected]` is what a
	// consumer overrides instead of the custom properties this chip deliberately does not publish.
	@property({ type: Boolean, reflect: true, bindingDefault: true, event: 'change' }) selected = false
	@property({ type: Boolean }) removable = false
	@property({ type: Boolean }) readonly = false
	/**
	 * The pattern of the group the chip is in, written by that group. Alone, a chip is a toggle.
	 * @ignore
	 */
	@property() selectionPattern?: SelectionGroupPattern
	@disabledProperty() disabled = false
	@property() href?: string
	@property() target?: '_blank' | '_parent' | '_self' | '_top'

	@query('#button') readonly actionElement!: HTMLElement
	@query('#remove') protected readonly removeElement?: HTMLButtonElement
	@query('slot:not([name])') private readonly labelSlot?: HTMLSlotElement

	static override get styles() {
		return css`
			:host {
				display: inline-flex;
				align-items: stretch;
				vertical-align: middle;
				/* Lets the start graphic's width animate between 0 and auto. Inherited, so it covers
				   everything below without being repeated. */
				interpolate-size: allow-keywords;
				--_transition-duration: 200ms;
				/* Material's 18dp glyph, and the target drawn around the remove one. */
				--_glyph-size: 1.125rem;
				--_remove-size: 1.5rem;
				--_remove-glyph-inset: calc((var(--_remove-size) - var(--_glyph-size)) / 2);
				min-height: 2rem;
				/* An inset outline rather than a layer of box-shadow, so elevation keeps box-shadow to
				   itself and both are plain CSS an outer rule can set. Drawn over the box like Material's
				   own absolutely-positioned one, so the 16px start space is measured from the edge. */
				outline: 1px solid var(--mo-color-gray-transparent);
				outline-offset: -1px;
				border-radius: var(--mo-border-radius);
				background: transparent;
				color: var(--mo-color-on-surface);
				font-size: 0.875rem;
				font-weight: 500;
				user-select: none;
				transition:
					background-color var(--_transition-duration) ease,
					outline-color var(--_transition-duration) ease,
					color var(--_transition-duration) ease;

				--md-ripple-hover-color: currentColor;
				--md-ripple-pressed-color: currentColor;
				--mo-focus-ring-color: currentColor;
			}

			@media (prefers-reduced-motion: reduce) {
				:host {
					--_transition-duration: 0s;
				}
			}

			/* A selected chip is a filled one, and its fill replaces the outline. Everything here is plain
			   CSS that an outer mo-chip[selected] rule overrides, which is why the chip publishes no
			   custom properties at all. */
			:host([selected]) {
				outline-color: transparent;
				background: var(--mo-color-selected);
				color: var(--mo-color-on-selected);
			}

			:host([disabled]) {
				pointer-events: none;
				opacity: 0.5;
			}

			#button {
				display: flex;
				align-items: center;
				flex: 1;
				position: relative;
				padding-inline: 0.75rem;
				transition: padding var(--_transition-duration) ease;
				border: none;
				border-radius: inherit;
				background: none;
				color: inherit;
				font: inherit;
				text-decoration: none;
				text-align: inherit;
				cursor: pointer;
				outline: none;
				-webkit-tap-highlight-color: transparent;

				&[data-readonly] {
					cursor: default;
				}

				/* Stamped by the template rather than selected for: :host(:has(...)) is not supported
				   everywhere, and one unsupported selector invalidates the whole rule it sits in. */
				&[data-start] {
					padding-inline-start: 0.5rem;
				}

				/* Material measures the 0.5rem to the end GLYPH, not to the button drawn around it. */
				&[data-action] {
					padding-inline-end: calc(0.5rem - var(--_remove-glyph-inset));
				}

				/* A graphic INSIDE the action is already the glyph, so there is no target to subtract — and
				   it wins over the rule above, whose inset belongs to the button outside. */
				&[data-end] {
					padding-inline-end: 0.5rem;
				}
			}

			#start {
				display: flex;
				align-items: center;
				margin-inline-end: 0;
				transition: margin-inline-end var(--_transition-duration) ease;

				#button[data-start] & {
					margin-inline-end: 0.5rem;
				}
			}

			/* The glyph fades as it grows: a half-revealed checkmark sliding out of a clipping edge at
			   full strength is what made the swap read oddly. */
			#check, #graphic {
				display: flex;
				align-items: center;
				overflow: clip;
				opacity: 1;
				transition:
					inline-size var(--_transition-duration) ease,
					opacity var(--_transition-duration) ease;
			}

			#check {
				inline-size: 0;
				opacity: 0;

				#button[data-selected] & {
					inline-size: auto;
					opacity: 1;
				}
			}

			#graphic {
				#button[data-selected] & {
					inline-size: 0;
					opacity: 0;
				}
			}

			#check > *, #graphic > *, slot[name=start]::slotted(*) {
				flex: 0 0 auto;
			}

			/* Material's label-large line height is deliberately not applied: the label is one
			   flex-centered line, and its 1.25rem leading lands the ink a pixel above center. */
			#label {
				line-height: normal;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			slot[name=action] {
				display: flex;
				align-items: center;
			}

			/* The end graphic is a flex item of the action, like the start one. The label cannot hold
			   it: the label is the inline box that makes the ellipsis work. */
			slot[name=end] {
				display: flex;
				align-items: center;
				flex: 0 0 auto;
				margin-inline-start: 0.25rem;
			}

			#remove {
				display: grid;
				place-items: center;
				position: relative;
				flex: 0 0 auto;
				align-self: center;
				inline-size: var(--_remove-size);
				block-size: var(--_remove-size);
				margin-inline-end: calc(0.5rem - var(--_remove-glyph-inset));
				padding: 0;
				border: none;
				border-radius: 50%;
				background: none;
				color: inherit;
				cursor: pointer;
				outline: none;
			}

			mo-icon {
				font-size: var(--_glyph-size);
			}

			::slotted([slot=start]), ::slotted([slot=end]), ::slotted([slot=action]) {
				font-size: var(--_glyph-size);
			}
		`
	}

	override focus(options?: FocusOptions) {
		this.actionElement?.focus(options)
	}

	protected readonly slotController = new SlotController(this)

	private get hasStart() {
		return this.selectable && this.selected || this.slotController.hasAssignedContent('start')
	}

	private get hasAction() {
		return this.removable || this.slotController.hasAssignedContent('action')
	}

	private get hasEnd() {
		return this.slotController.hasAssignedContent('end')
	}

	/** A link navigates and a read-only chip is a tag; neither carries a selection whatever it is told. */
	private get announcesSelection() {
		return this.selectable && !this.readonly && !this.href
	}

	/** One of a set that is never empty is a radio, and says `checked` rather than `pressed`. */
	private get isRadio() {
		return this.selectionPattern === SelectionGroupPattern.Radio
	}

	protected override get template() {
		return html`
			${this.primaryActionTemplate}
			${!this.slotController.hasAssignedContent('action') ? html.nothing : html`<slot name='action'></slot>`}
			${this.removeTemplate}
		`
	}

	protected get primaryActionTemplate() {
		const tag = this.readonly ? literal`span` : this.href ? literal`a` : literal`button`
		return staticHtml`
			<${tag} id='button' part='button'
				?data-start=${this.hasStart}
				?data-action=${this.hasAction}
				?data-end=${this.hasEnd}
				?data-readonly=${this.readonly}
				?data-selected=${this.selectable && this.selected}
				type=${ifDefined(this.readonly || this.href ? undefined : 'button')}
				href=${ifDefined(this.readonly ? undefined : this.href)}
				target=${ifDefined(this.href ? this.target : undefined)}
				?disabled=${!this.readonly && !this.href && this.disabled}
				role=${ifDefined(this.announcesSelection && this.isRadio ? 'radio' : undefined)}
				aria-checked=${ifDefined(this.announcesSelection && this.isRadio ? String(this.selected) : undefined)}
				aria-pressed=${ifDefined(this.announcesSelection && !this.isRadio ? String(this.selected) : undefined)}
				@click=${this.handleClick}
			>
				${this.readonly ? html.nothing : html`
					<md-ripple ?disabled=${this.disabled}></md-ripple>
					<mo-focus-ring inward></mo-focus-ring>
				`}
				<span id='start'>${this.startTemplate}</span>
				<span id='label' part='label'>
					<slot @slotchange=${() => this.requestUpdate()}></slot>
				</span>
				${!this.slotController.hasAssignedContent('end') ? html.nothing : html`<slot name='end'></slot>`}
			</${tag}>
		`
	}

	/**
	 * Both graphics stay in the DOM and swap by width, so selecting and deselecting animate alike.
	 * Rendering one in place of the other collapses the outgoing box to zero in the same frame the
	 * transition starts, which leaves it nothing to interpolate — only the arriving chip would move.
	 */
	protected get startTemplate() {
		return html`
			${!this.selectable ? html.nothing : html`
				<span id='check'>
					<mo-icon icon='done'></mo-icon>
				</span>
			`}
			<span id='graphic'>
				<slot name='start'></slot>
			</span>
		`
	}

	protected get removeTemplate() {
		return !this.removable ? html.nothing : html`
			<button id='remove' part='remove' type='button'
				?disabled=${this.disabled}
				aria-label=${t('Remove ${label:string}', { label: this.labelText })}
				@click=${this.handleRemoveClick}
			>
				<md-ripple ?disabled=${this.disabled}></md-ripple>
				<mo-focus-ring inward></mo-focus-ring>
				<mo-icon icon='close'></mo-icon>
			</button>
		`
	}

	private get labelText() {
		return this.labelSlot?.assignedNodes()
			.map(node => node.textContent ?? '')
			.join(' ')
			.trim() || ''
	}

	protected handleClick() {
		if (!this.announcesSelection) {
			return
		}
		// Asked before it is taken, so that whoever owns the selection — a group, or a consumer with a
		// confirmation to run first — refuses it and rules instead of correcting a state the chip already
		// announced. Left alone, the chip is the owner and answers itself.
		if (!this.requestSelect(!this.selected)) {
			return
		}
		this.selected = !this.selected
		this.change.dispatch(this.selected)
	}

	protected requestSelect(selected: boolean) {
		return this.dispatchEvent(new CustomEvent<boolean>('requestSelect', {
			detail: selected,
			bubbles: true,
			cancelable: true,
		}))
	}

	protected handleRemoveClick(event: Event) {
		// A press on the remove button is not a press on the chip, for consumers listening on the host.
		event.stopPropagation()
		this.requestRemove()
	}

	@eventListener('keydown')
	protected handleKeyDown(event: KeyboardEvent) {
		const target = event.composedPath()[0]
		if (target !== this.actionElement && target !== this.removeElement) {
			return
		}

		if (this.removable && !this.disabled && (event.key === 'Backspace' || event.key === 'Delete')) {
			event.preventDefault()
			this.requestRemove()
			return
		}

		const remove = this.removeElement
		if (!remove || event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
			return
		}
		const forwards = (getComputedStyle(this).direction === 'rtl') === (event.key === 'ArrowLeft')
		const next = forwards ? remove : this.actionElement
		if (next === target) {
			// At the chip's edge in that direction: the group moves on to the next chip.
			return
		}
		event.preventDefault()
		event.stopPropagation()
		next.focus()
	}

	protected requestRemove() {
		return this.dispatchEvent(new Event('requestRemove', { bubbles: true, cancelable: true }))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-chip': Chip
	}
}