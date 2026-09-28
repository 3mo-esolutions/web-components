import { Component, component, css, html, ifDefined, isServer, property, type PropertyValues } from '@a11d/lit'
import { MutationController } from '@3mo/mutation-observer'
import { HydrationController } from '@3mo/slot-controller'
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
import { type MaterialIcon } from '@3mo/icon'
import { MdFab } from '@material/web/fab/fab.js'
import '@3mo/theme'

/**
 * A floating action button for the primary action of a screen, extended with a label when it has text.
 *
 * @element mo-fab
 *
 * @ssr true
 *
 * @attr icon - The Material icon to display.
 * @attr dense - Makes it the small FAB.
 * @attr iconAtEnd - Places the icon after the label.
 *
 * @slot - The label, which makes it an extended FAB.
 * @slot icon - Content in place of the icon.
 *
 * @csspart button - The native button element.
 * @csspart ripple - The ripple effect.
 * @csspart focus-ring - The focus ring.
 */
@component('mo-fab')
export class Fab extends Component {
	@property() icon?: MaterialIcon
	@property({ type: Boolean }) iconAtEnd = false
	@property({ type: Boolean }) dense = false

	protected readonly instanceofAttributeController = new InstanceofAttributeController(this)
	protected readonly mutationController = isServer ? undefined : new MutationController(this, {
		config: {
			subtree: true,
			characterData: true,
			childList: true,
		}
	})
	protected readonly hydrationController = new HydrationController(this)

	protected override initialized() {
		this.requestUpdate()
	}

	static override get styles() {
		return css`
			:host {
				display: inline-block;
				user-select: none;
			}

			md-fab {
				--md-fab-label-text-size: medium;

				--md-fab-background-color: var(--mo-color-accent);
				--md-fab-foreground-color: var(--mo-color-on-accent);
				--md-focus-ring-color: var(--mo-color-accent);

				--md-fab-primary-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-hover-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-focus-state-layer-color: var(--mo-color-on-accent);
				--md-fab-primary-pressed-state-layer-color: var(--mo-color-on-accent);
			}

			md-fab::part(button) {
				gap: 8px;
			}

			:host([iconAtEnd]) md-fab::part(button) {
				flex-direction: row-reverse;
				padding-inline: 20px 16px;
			}
		`
	}

	protected get label() {
		return isServer || this.hydrationController.hydrating ? undefined : [...this.childNodes]
			.filter(node => !(node instanceof Element && node.slot))
			.map(node => node.textContent)
			.join('')
			.trim() || undefined
	}

	protected override get template() {
		return html`
			<md-fab exportparts='button,ripple,focus-ring' variant='primary'
				label=${ifDefined(this.label)}
				size=${this.dense ? 'small' : 'medium'}
			>
				<slot name='icon' slot='icon'>
					<mo-icon icon=${ifDefined(this.icon)}></mo-icon>
				</slot>
			</md-fab>
		`
	}
}

// Server-rendered fabs are constructed once Material defines them, before an initializer could be added.
const updated = MdFab.prototype['updated']
MdFab.prototype['updated'] = function (this: MdFab, changedProperties: PropertyValues) {
	updated.call(this, changedProperties)
	this.renderRoot.querySelector('button')?.part.add('button')
	this.renderRoot.querySelector('md-ripple')?.part.add('ripple')
	this.renderRoot.querySelector('md-focus-ring')?.part.add('focus-ring')
}

MdFab.elementStyles.push(css`
	button { background: var(--md-fab-background-color) !important; }
	.icon, .label { color: var(--md-fab-foreground-color) !important; }
`)


declare global {
	interface HTMLElementTagNameMap {
		'mo-fab': Fab
	}
}