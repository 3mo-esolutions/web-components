import { component, property, query, html, css, nothing, event, state, Component } from '@a11d/lit'
import { DialogActionKey, DialogComponent } from '@a11d/lit-application'
import { Dialog as MwcDialog } from '@material/mwc-dialog'
import { tooltip } from '@3mo/tooltip'
import { SlotController } from '@3mo/slot-controller'
import '@3mo/localization'

export const enum DialogSize {
	Large = 'large',
	Medium = 'medium',
	Small = 'small',
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
 * @attr scrimClickAction
 * @attr preventCancellationOnEscape
 * @attr preventCancellationOnEscape
 * @attr poppable
 * @attr boundToWindow
 *
 * @slot - Content of the dialog
 * @slot primaryAction - Primary action of the dialog
 * @slot secondaryAction - Secondary action of the dialog
 * @slot header - Header of the dialog
 * @slot footer - Footer of the dialog
 *
 * @cssprop --mo-dialog-heading-color - Color of the dialog heading
 * @cssprop --mo-dialog-content-color - Color of the dialog content
 * @cssprop --mo-dialog-divider-color - Color of the dialog divider
 * @cssprop --mo-dialog-scrim-color - Color of the dialog scrim
 * @cssprop --mo-dialog-scrim-color - Color of the dialog scrim
 * @cssprop --mo-dialog-divider-color - Color of the dialog divider
 * @cssprop --mo-dialog-height - Height of the dialog
 * @cssprop --mo-dialog-width - Width of the dialog
 * @cssprop --mo-dialog-heading-line-height - Line height of the dialog heading
 *
 * @i18n "Close"
 *
 * @fires dialogHeadingChange - Dispatched when the dialog heading changes
 * @fires requestPopup - Dispatched when the dialog is requested to be popped up
 */
@component('mo-dialog')
@DialogComponent.dialogElement()
export class Dialog extends Component {
	static readonly executingActionAdaptersByComponent = new Map<Constructor<HTMLElement>, (actionElement: HTMLElement, isExecuting: boolean) => void>()

	@event({ bubbles: true, cancelable: true, composed: true }) readonly dialogHeadingChange!: EventDispatcher<string>
	@event() readonly requestPopup!: EventDispatcher

	@property({ type: Boolean }) open = false
	@property({ updated(this: Dialog) { this.dialogHeadingChange.dispatch(this.heading) } }) heading = ''
	@property({ reflect: true }) size = DialogSize.Small
	@property({ type: Boolean }) blocking = false
	@property({ type: Boolean }) primaryOnEnter = false
	@property({ type: Boolean }) manualClose = false
	@property() primaryButtonText?: string
	@property() secondaryButtonText?: string
	@property({ type: Boolean }) preventCancellationOnEscape = false
	@property({ type: Boolean }) poppable = false
	@property({ type: Boolean, reflect: true }) boundToWindow = false

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

	@query('mo-icon-button[icon=close]') readonly cancellationActionElement!: HTMLElement

	handleAction!: (key: DialogActionKey) => void | Promise<void>

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			mwc-dialog {
				--mdc-dialog-heading-ink-color: var(--mo-dialog-heading-color, var(--mo-color-foreground, rgba(0, 0, 0)));
				--mdc-dialog-content-ink-color: var(--mo-dialog-content-color, var(--mo-color-foreground-transparent, rgba(48, 48, 48)));
				--mdc-dialog-scroll-divider-color: var(--mo-dialog-divider-color, var(--mo-color-gray-transparent, rgba(121, 121, 121, 0.5)));
				--mdc-dialog-scrim-color: var(--mo-dialog-scrim-color, rgba(0, 0, 0, 0.5));
			}

			:host([size=small]) mwc-dialog {
				--mo-dialog-default-width: 480px;
				--mo-dialog-default-height: auto;
			}

			:host([size=medium]) mwc-dialog {
				--mo-dialog-default-width: 1024px;
				--mo-dialog-default-height: 768px;
			}

			:host([size=large]) mwc-dialog {
				--mo-dialog-default-width: 1680px;
				--mo-dialog-default-height: 100vh;
				--mo-dialog-default-height: 100dvh;
			}

			:host([boundToWindow][size=large]) mwc-dialog {
				--mo-dialog-default-width: 100vw;
				--mo-dialog-default-height: 100vh;
				--mo-dialog-default-height: 100dvh;
			}

			:host([boundToWindow]) mwc-dialog {
				--mdc-dialog-scrim-color: var(--mo-dialog-scrim-color, var(--mo-color-background, rgba(255, 255, 255)));
			}

			:host([size=large]) mwc-dialog::part(heading) {
				padding-bottom: 15px;
				border-bottom: 1px solid;
			}

			:host([size=large]) mwc-dialog::part(content) {
				padding-top: 8px;
				padding-bottom: 8px;
			}

			:host([size=large]) mwc-dialog::part(actions), :host([size=large]) mwc-dialog::part(heading) {
				border-color: var(--mdc-dialog-scroll-divider-color);
			}
		`
	}
	override async disconnected() {
		const host = await DialogComponent.getHost()
		const dialogComponents = [...host.children].filter(e => e instanceof DialogComponent)
		if (dialogComponents.length === 0) {
			document.body.style.removeProperty('overflow')
		}
	}

	private get shallHideActions() {
		return !this.primaryActionElement
			&& !this.secondaryActionElement
			&& !this.slotController.hasAssignedContent('footer')
	}

	protected get dialogHeading() {
		return this.heading
	}

	protected override get template() {
		return html`
			<mwc-dialog
				heading=${this.dialogHeading || ' '}
				initialFocusAttribute='data-focus'
				scrimClickAction=''
				escapeKeyAction=''
				defaultAction=''
				exportparts='heading,surface,footer,scrim,content,actions'
				?open=${this.open}
				?hideActions=${this.shallHideActions}
				@requestClose=${() => this.handleAction(DialogActionKey.Cancellation)}
			>
				<mo-flex slot='header' direction='horizontal-reversed' alignItems='center' gap='4px'>
					${this.headerOptionsTemplate}
					${this.headerSlotTemplate}
				</mo-flex>
				${this.contentSlotTemplate}
				${this.footerSlotTemplate}
				${this.primaryActionSlotTemplate}
				${this.secondaryActionSlotTemplate}
			</mwc-dialog>
		`
	}

	protected get headerSlotTemplate() {
		return html`
			<slot name='header'>${this.headerDefaultTemplate}</slot>
		`
	}

	protected get headerDefaultTemplate() {
		return nothing
	}

	protected get headerOptionsTemplate() {
		return html`
			${this.boundToWindow || this.blocking ? nothing : html`
				<mo-icon-button icon='close' ${tooltip(t('Close'))} @click=${() => this.handleAction(DialogActionKey.Cancellation)}></mo-icon-button>
			`}
			${this.boundToWindow || !this.poppable || true as boolean ? nothing : html`
				<mo-icon-button icon='launch' @click=${() => this.requestPopup.dispatch()}></mo-icon-button>
			`}
		`
	}

	protected get contentSlotTemplate() {
		return html`
			<slot>${this.contentDefaultTemplate}</slot>
		`
	}

	protected get contentDefaultTemplate() {
		return nothing
	}

	protected get footerSlotTemplate() {
		return html`
			<slot name='footer' slot='footer'>${this.footerDefaultTemplate}</slot>
		`
	}

	protected get footerDefaultTemplate() {
		return nothing
	}

	protected get primaryActionSlotTemplate() {
		return html`
			<slot name='primaryAction' slot='primaryAction' @click=${() => this.handleAction(DialogActionKey.Primary)}>
				${this.primaryActionDefaultTemplate}
			</slot>
		`
	}

	protected get primaryActionDefaultTemplate() {
		return !this.primaryButtonText ? nothing : html`
			<mo-loading-button type='raised'>
				${this.primaryButtonText}
			</mo-loading-button>
		`
	}

	get primaryActionElement() {
		return this.querySelector<HTMLElement>('[slot=primaryAction]')
			?? this.renderRoot.querySelector<HTMLElement>('slot[name=primaryAction] > *') ?? undefined
	}

	protected get secondaryActionSlotTemplate() {
		return html`
			<slot name='secondaryAction' slot='secondaryAction' @click=${() => this.handleAction(DialogActionKey.Secondary)}>
				${this.secondaryActionDefaultTemplate}
			</slot>
		`
	}

	protected get secondaryActionDefaultTemplate() {
		return !this.secondaryButtonText ? nothing : html`
			<mo-loading-button>
				${this.secondaryButtonText}
			</mo-loading-button>
		`
	}

	get secondaryActionElement() {
		return this.querySelector<HTMLElement>('[slot=secondaryAction]')
			?? this.renderRoot.querySelector<HTMLElement>('slot[name=secondaryAction] > *') ?? undefined
	}
}

MwcDialog.elementStyles.push(css`
	.mdc-dialog .mdc-dialog__surface {
		height: var(--mo-dialog-height, var(--mo-dialog-default-height));
		max-height: calc(100vh - 32px);
		max-height: calc(100dvh - 32px);

		width: var(--mo-dialog-width, var(--mo-dialog-default-width));
		max-width: calc(100vw - 32px);
	}

	@media (max-width: 1024px), (max-height: 768px) {
		.mdc-dialog .mdc-dialog__surface {
			max-height: 100vh;
			max-height: 100dvh;
			max-width: 100vw;
		}
	}

	.mdc-dialog__actions {
		padding: 16px;
	}

	#actions {
		gap: 12px;
	}

	#title {
		padding-inline-end: 48px;
	}

	slot[name=footer] {
		flex: 1;
	}

	#content {
		scrollbar-color: rgba(128, 128, 128, 0.75) transparent;
		scrollbar-width: thin;
	}

	#content::-webkit-scrollbar {
		width: 5px;
		height: 5px;
	}

	#content::-webkit-scrollbar-thumb {
		background: rgba(128, 128, 128, 0.75);
	}

	#title {
		padding: 0;
		margin: 0;
	}

	mo-flex[part=heading] {
		padding: 14px 12px 10px 24px;
		align-items: flex-start;
	}

	mo-heading {
		flex: 1;
		margin-block-start: 4px;
		-webkit-font-smoothing: antialiased;
		font-size: 1.25rem;
		line-height: var(--mo-dialog-heading-line-height, 2rem);
		font-weight: 500;
		letter-spacing: 0.0125em;
		text-decoration: inherit;
		text-transform: inherit;
	}

	slot[name=footer] {
		display: flex;
	}

	slot[name=footer]::slotted(*) {
		margin-left: initial !important;
	}

	.mdc-dialog--scrollable [part=heading] {
		padding-bottom: 15px;
		border-bottom: 1px solid var(--mdc-dialog-scroll-divider-color);
	}
`)

MwcDialog.addInitializer(element => {
	element.addController(new class {
		private get dialog() { return element as MwcDialog }
		private get footerElement() { return this.dialog.renderRoot.querySelector('footer') }
		private get surfaceElement() { return this.dialog.renderRoot.querySelector('.mdc-dialog__surface') }
		private get contentElement() { return this.dialog['contentElement'] }
		private get titleElement() { return this.dialog.renderRoot.querySelector('#title') }
		private get scrimElement() { return this.dialog.renderRoot.querySelector('.mdc-dialog__scrim') }
		private get actionsElement() { return this.dialog.renderRoot.querySelector('#actions') }

		constructor() {
			this.overrideKeydownBehavior()
		}

		overrideKeydownBehavior() {
			const setEventListenersBase = this.dialog['setEventListeners']
			this.dialog['setEventListeners'] = () => {
				this.dialog['boundHandleKeydown'] = null
				setEventListenersBase.call(this.dialog)
			}
		}

		async hostConnected() {
			this.dialog.addEventListener('closed', this.handleClosed)
			this.replaceHeader()
			await this.dialog.updateComplete
			this.titleElement?.setAttribute('part', 'heading')
			this.surfaceElement?.setAttribute('part', 'surface')
			this.footerElement?.setAttribute('part', 'footer')
			this.scrimElement?.setAttribute('part', 'scrim')
			this.contentElement.setAttribute('part', 'content')
			this.actionsElement?.setAttribute('part', 'actions')
			this.addFooterSlot()
			this.overrideKeydownBehavior()
		}

		hostDisconnected() {
			this.dialog.removeEventListener('closed', this.handleClosed)
		}

		protected handleClosed(e: Event) {
			// Google MWC has events in some of their components
			// which dispatch a "closed" event with "bubbles" option set to true
			// thus reaching the MwcDialog. This is blocked here.
			if (e.target instanceof MwcDialog === false) {
				e.stopImmediatePropagation()
				return
			}
		}

		private addFooterSlot() {
			const footer = document.createElement('slot')
			footer.name = 'footer'
			this.footerElement?.insertBefore(footer, this.footerElement.firstChild)
		}

		private replaceHeader() {
			this.dialog['renderHeading'] = function (this: MwcDialog) {
				return html`
					<mo-flex part='heading' direction='horizontal' gap='4px'>
						<mo-heading typography='heading4'>${this.heading}</mo-heading>
						<slot name='header'></slot>
					</mo-flex>
				`
			}
		}

		async hostUpdated() {
			await this.dialog.updateComplete
			this.overrideCloseBehavior()
		}

		private overrideCloseBehavior() {
			const isDialogActionKey = (key: string): key is DialogActionKey => {
				return key === DialogActionKey.Primary || key === DialogActionKey.Secondary || key === DialogActionKey.Cancellation
			}
			const foundation = this.dialog['mdcFoundation']
			const closeBase = foundation.close
			foundation.close = async (action?: string) => {
				const host = await DialogComponent.getHost()
				const dialogComponents = [...host.children].filter(e => e instanceof DialogComponent)
				if (action && dialogComponents.reverse()[0] === this.dialog && isDialogActionKey(action)) {
					closeBase.call(foundation, action)
					this.dialog.dispatchEvent(new CustomEvent('requestClose'))
				}
			}
		}
	})
})

declare global {
	interface HTMLElementTagNameMap {
		'mo-dialog': Dialog
	}
}