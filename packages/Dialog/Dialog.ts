import { component, property, query, html, css, event, state, Component, ifDefined } from '@a11d/lit'
import { type ApplicationTopLayer, DialogActionKey, DialogComponent, type Dialog as IDialog } from '@a11d/lit-application'
import { MdDialog } from '@material/web/dialog/dialog.js'
import { tooltip } from '@3mo/tooltip'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/localization'

export enum DialogSize {
	Large = 'large',
	Medium = 'medium',
	Small = 'small',
}

const queryActionElement = (slotName: string) => {
	return (prototype: Component, propertyKey: string) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: Component) {
				return this.querySelector<HTMLElement>(`[slot=${slotName}]`)
					?? this.renderRoot.querySelector<HTMLElement>(`slot[name=${slotName}] > *`) ?? undefined
			}
		})
	}
}

/**
 * @element mo-dialog
 *
 * @attr open
 * @attr heading
 * @attr size
 * @attr blocking
 * @attr primaryOnEnter
 * @attr manualClose
 * @attr primaryButtonText
 * @attr secondaryButtonText
 *
 * @slot - Content of the dialog
 * @slot primaryAction - Primary action of the dialog
 * @slot secondaryAction - Secondary action of the dialog
 * @slot action - Additional actions of the dialog which are displayed in the header
 * @slot footer - Footer of the dialog
 *
 * @csspart heading - Dialog heading
 * @csspart header - Dialog footer
 * @csspart content - Dialog content
 * @csspart footer - Dialog footer
 *
 * @cssprop --mo-dialog-heading-color - Color of the dialog heading
 * @cssprop --mo-dialog-content-color - Color of the dialog content
 * @cssprop --mo-dialog-scrim-color - Color of the dialog scrim
 * @cssprop --mo-dialog-divider-color - Color of the dialog divider
 * @cssprop --mo-dialog-heading-line-height - Line height of the dialog heading
 *
 * @i18n "Close"
 * @i18n "Open as Tab"
 *
 * @fires pageHeadingChange - Dispatched when the dialog heading changes
 * @fires requestPopup - Dispatched when the dialog is requested to be popped up
 */
@component('mo-dialog')
@DialogComponent.dialogElement()
export class Dialog extends Component implements IDialog {
	static disablePoppability = false
	static readonly executingActionAdaptersByComponent = new Map<Constructor<HTMLElement>, (actionElement: HTMLElement, isExecuting: boolean) => void>()

	@event({ bubbles: true, cancelable: true, composed: true }) readonly pageHeadingChange!: EventDispatcher<string>
	@event() readonly requestPopup!: EventDispatcher

	@property({
		type: Boolean,
		async updated(this: Dialog) {
			if (this.open === true) {
				await new Promise(requestAnimationFrame)
				this.querySelector<any>('[autofocus]')?.focus()
			}
		}
	}) open = false
	@property({ updated(this: Dialog) { this.pageHeadingChange.dispatch(this.heading) } }) heading = ''
	@property({ reflect: true }) size?: DialogSize
	@property({ type: Boolean }) blocking = false
	@property({ type: Boolean }) primaryOnEnter = false
	@property({ type: Boolean }) manualClose = false
	@property() primaryButtonText?: string
	@property() secondaryButtonText?: string
	@state() poppable = false
	@state() boundToWindow = false

	@state({
		updated(this: Dialog) {
			if (this.primaryActionElement) {
				const PrimaryButtonConstructor = this.primaryActionElement.constructor as Constructor<HTMLElement>
				Dialog.executingActionAdaptersByComponent.get(PrimaryButtonConstructor)?.(this.primaryActionElement, this.executingAction === DialogActionKey.Primary)
			}

			if (this.secondaryActionElement) {
				const SecondaryButtonConstructor = this.secondaryActionElement.constructor as Constructor<HTMLElement>
				Dialog.executingActionAdaptersByComponent.get(SecondaryButtonConstructor)?.(this.secondaryActionElement, this.executingAction === DialogActionKey.Secondary)
			}
		}
	}) executingAction?: DialogActionKey

	@state() private showTopLayer = false

	get preventCancellationOnEscape() {
		return this.blocking
	}

	@query('lit-application-top-layer') readonly topLayerElement!: ApplicationTopLayer
	@queryActionElement('primaryAction') readonly primaryActionElement!: HTMLElement
	@queryActionElement('secondaryAction') readonly secondaryActionElement!: HTMLElement
	@query('mo-icon-button[icon=close]') readonly cancellationActionElement!: HTMLElement

	handleAction!: (key: DialogActionKey) => void | Promise<void>

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host {
				background: var(--mo-color-surface);
				height: fit-content;
				width: fit-content;
			}

			:host([size=small]) {
				width: 480px;
			}

			:host([size=medium]) {
				width: 1024px;
			}

			:host([size=large]) {
				width: 1680px;
				height: 100vh;
				height: 100dvh;
			}

			md-dialog {
				height: inherit;
				width: inherit;
				--md-dialog-scroll-divider-color: var(--mo-dialog-divider-color, var(--mo-color-transparent-gray-3));
				--md-sys-color-surface-container-high: var(--mo-color-surface);
				border-radius: var(--mo-border-radius);

				&:not([open]) {
					display: none;
				}

				&::part(scrim) {
					background-color: var(--mo-dialog-scrim-color, var(--mo-dialog-default-scrim-color, rgba(0, 0, 0, 0.5)));
				}

				&[data-size=large] {
					&::part(content) {
						padding-top: 8px;
						padding-bottom: 8px;
					}

					&::part(divider) {
						display: inline-flex !important;
					}
				}

				&::part(dialog) {
					height: inherit;
					max-height: calc(100vh - 32px);
					max-height: calc(100dvh - 32px);

					width: inherit;
					max-width: calc(100vw - 32px);

					justify-content: center;

					box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);

					@media (max-width: 1024px), (max-height: 768px) {
						max-height: 100vh !important;
						max-height: 100dvh !important;
						max-width: 100vw !important;
					}
				}

				&[data-bound-to-window] {
					--mo-dialog-default-scrim-color: var(--mo-color-background);
					--_margin-alteration: calc(-1 * max(min(1rem, 1vw), min(1rem, 1vh)));
					&::part(dialog) {
						max-height: 100vh !important;
						max-height: 100dvh !important;
						max-width: 100vw !important;
					}
				}
			}

			#header {
				padding-block: 14px 10px;
				padding-inline: 24px 12px;

				&[data-size=large] {
					padding-block-end: 15px;
				}

				mo-heading {
					margin-block-start: 4px;
					-webkit-font-smoothing: antialiased;
					font-size: 1.25rem;
					line-height: var(--mo-dialog-heading-line-height, 2rem);
					font-weight: 500;
					text-decoration: inherit;
					text-transform: inherit;
					color: var(--mo-dialog-heading-color, var(--mo-color-foreground));
				}
			}

			mo-page {
				&[data-bound-to-window] {
					--mo-page-gap: 0;
				}
			}

			#content {
				flex: 1;
				padding: 20px 24px;
				-webkit-font-smoothing: antialiased;
				font-size: 1rem;
				line-height: 1.5rem;
				font-weight: 400;
				text-decoration: inherit;
				text-transform: inherit;
				color: var(--mo-dialog-content-color, var(--mo-color-foreground));
				&[data-bound-to-window] {
					margin-inline: var(--_margin-alteration);
				}
			}

			#footer {
				padding: 16px;
				gap: 8px;

				&[data-bound-to-window] {
					position: sticky;
					inset-block-end: 0;
					inset-inline: 0;
					background: var(--mo-color-background);
					border-block-start: 1px solid var(--mo-color-transparent-gray-3);
					margin-inline: var(--_margin-alteration);
					margin-block-end: var(--_margin-alteration);
					z-index: 10;
				}

				slot[name=footer] {
					display: flex;
					flex: 1;
					align-items: center;
					gap: 8px;
				}
			}
		`
	}

	protected get dialogHeading() {
		return this.heading
	}

	protected override get template() {
		return this.boundToWindow ? html`
			<mo-page heading=${this.heading} exportparts='header,heading' ?data-bound-to-window=${this.boundToWindow}>
				<slot name='action' slot='action'></slot>
				${this.contentTemplate}
				${this.footerTemplate}
			</mo-page>
		` : html`
			<md-dialog exportparts='scrim' quick
				?open=${this.open}
				?data-bound-to-window=${this.boundToWindow}
				data-size=${ifDefined(this.size)}
				@scroll=${(e: Event) => this.dispatchEvent(new Event('scroll', e))}
				@cancel=${(e: Event) => e.preventDefault()}
				@open=${() => this.showTopLayer = true}
				@close=${() => this.showTopLayer = false}
			>
				${this.headerTemplate}
				${this.contentTemplate}
				${this.footerTemplate}
				${this.topLayerTemplate}
			</md-dialog>
		`
	}

	protected get headerTemplate() {
		return html`
			<mo-flex id='header' ?data-size=${this.size} slot=${this.boundToWindow ? '' : 'headline'} part='header' direction='horizontal'>
				${this.headingTemplate}
				<mo-flex direction='horizontal-reversed' alignItems='center' gap='4px' style='flex: 1'>
					${this.actionsTemplate}
					<slot name='action' style='font-size: 1rem; line-height: initial;'></slot>
				</mo-flex>
			</mo-flex>
		`
	}

	protected get headingTemplate() {
		return html`
			<mo-heading part='heading' typography='heading4'>${this.dialogHeading}</mo-heading>
		`
	}

	protected get actionsTemplate() {
		return html`
			${this.boundToWindow || this.blocking ? html.nothing : html`
				<mo-icon-button icon='close' ${tooltip(t('Close'))} @click=${() => this.handleAction(DialogActionKey.Cancellation)}></mo-icon-button>
			`}
			${Dialog.disablePoppability || !this.poppable ? html.nothing : html`
				<mo-icon-button icon='launch' ${tooltip(t('Open as Tab'))} @click=${() => this.requestPopup.dispatch()}></mo-icon-button>
			`}
		`
	}

	protected get contentTemplate() {
		return html`
			<form id='content' ?data-bound-to-window=${this.boundToWindow} slot=${this.boundToWindow ? '' : 'content'} part='content' method='dialog'>
				<slot>${this.contentDefaultTemplate}</slot>
			</form>
		`
	}

	protected get topLayerTemplate() {
		return !this.showTopLayer ? html.nothing : html`
			<lit-application-top-layer slot='top-layer'></lit-application-top-layer>
		`
	}

	protected get contentDefaultTemplate() {
		return html.nothing
	}

	private get shallHideFooter() {
		return !this.primaryActionElement
			&& !this.primaryButtonText
			&& this.primaryActionDefaultTemplate === html.nothing
			&& !this.secondaryActionElement
			&& !this.secondaryButtonText
			&& this.secondaryActionDefaultTemplate === html.nothing
			&& !this.slotController.hasAssignedContent('footer')
	}

	protected get footerTemplate() {
		return this.shallHideFooter ? html.nothing : html`
			<mo-flex id='footer' ?data-bound-to-window=${this.boundToWindow} slot=${this.boundToWindow ? '' : 'actions'} part='footer' direction='horizontal-reversed'>
				${this.primaryActionSlotTemplate}
				${this.secondaryActionSlotTemplate}
				${this.footerSlotTemplate}
			</mo-flex>
		`
	}

	protected get footerSlotTemplate() {
		return html`
			<slot name='footer'>${this.footerDefaultTemplate}</slot>
		`
	}

	protected get footerDefaultTemplate() {
		return html.nothing
	}

	protected get primaryActionSlotTemplate() {
		return html`
			<slot name='primaryAction' @click=${() => this.handleAction(DialogActionKey.Primary)}>
				${this.primaryActionDefaultTemplate}
			</slot>
		`
	}

	protected get primaryActionDefaultTemplate() {
		return !this.primaryButtonText ? html.nothing : html`
			<mo-loading-button type='elevated'>
				${this.primaryButtonText}
			</mo-loading-button>
		`
	}

	protected get secondaryActionSlotTemplate() {
		return html`
			<slot name='secondaryAction' @click=${() => this.handleAction(DialogActionKey.Secondary)}>
				${this.secondaryActionDefaultTemplate}
			</slot>
		`
	}

	protected get secondaryActionDefaultTemplate() {
		return !this.secondaryButtonText ? html.nothing : html`
			<mo-loading-button>
				${this.secondaryButtonText}
			</mo-loading-button>
		`
	}
}

MdDialog.elementStyles.push(css`
	:host {
		background: inherit;
	}

	dialog {
		background: inherit;
	}

	.container::before {
		background: inherit;
	}

	.content {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.scroller {
		/* MdDialog removes overflow whenever the dialog doesn't need a scroll.
		 * This leads to "min-height: 100%" of the ".content" element not working anymore.
		 *
		 * For Safari, where popovers that exceed the dialog height are not scrollable, we may need to set overflow to "visible" instead of "auto".
		 */
		overflow: var(--mo-dialog-scroller-overflow, auto);
	}

	.scroller::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}

	.scroller::-webkit-scrollbar-thumb {
		background: rgba(128, 128, 128, 0.75);
	}

	md-divider {
		--md-divider-color: var(--md-dialog-scroll-divider-color);
	}

	.scrim {
		opacity: 1;
	}

	.headline {
		/* .content has a default z-index of 1 in Material */
		z-index: 2;
	}

	.actions {
		z-index: 0;
	}
`)

MdDialog.addInitializer(element => {
	element.addController(new class {
		private get scrollerElement() {
			return element.renderRoot.querySelector('.scroller')
		}

		async hostConnected() {
			await element.updateComplete
			this.scrollerElement?.addEventListener('scroll', this.handleScroll)
		}

		hostDisconnected() {
			this.scrollerElement?.removeEventListener('scroll', this.handleScroll)
		}

		private handleScroll = (scrollEvent: Event) => {
			element.dispatchEvent(new Event('scroll', scrollEvent))
			// https://devdoc.net/web/developer.mozilla.org/en-US/docs/Web/Events/scroll.html
			window.dispatchEvent(new Event('scroll', scrollEvent))
		}

		hostUpdated() {
			element.renderRoot.querySelector('dialog')?.part.add('dialog')
			element.renderRoot.querySelector('.scrim')?.part.add('scrim')
			element.renderRoot.querySelectorAll('md-divider')?.forEach(divider => divider.part.add('divider'))
			this.renderTopLayerSlot()
		}

		private renderTopLayerSlot() {
			if (!element.renderRoot.querySelector('slot[name=top-layer]')) {
				const topLayerSlot = document.createElement('slot')
				topLayerSlot.name = 'top-layer'
				element.renderRoot.querySelector('dialog')?.appendChild(topLayerSlot)
			}
		}
	})
})

declare global {
	interface HTMLElementTagNameMap {
		'mo-dialog': Dialog
	}
}