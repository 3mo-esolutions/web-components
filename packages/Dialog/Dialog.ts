import { component, property, query, html, css, event, state, Component } from '@a11d/lit'
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
 * @attr poppable
 * @attr boundToWindow
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
 * @cssprop --mo-dialog-height - Height of the dialog
 * @cssprop --mo-dialog-width - Width of the dialog
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
	@property({ reflect: true }) size = DialogSize.Small
	@property({ type: Boolean }) blocking = false
	@property({ type: Boolean }) primaryOnEnter = false
	@property({ type: Boolean }) manualClose = false
	@property() primaryButtonText?: string
	@property() secondaryButtonText?: string
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
			}

			:host([size=small]) {
				--mo-dialog-width: 480px;
				--mo-dialog-height: min-content;
			}

			:host([size=medium]) {
				--mo-dialog-width: 1024px;
				--mo-dialog-height: 768px;
			}

			:host([size=large]) {
				--mo-dialog-width: 1680px;
				--mo-dialog-height: 100vh;
				--mo-dialog-height: 100dvh;
			}

			:host([boundToWindow]) {
				--mo-dialog-default-scrim-color: var(--mo-color-background);
				--_margin-alteration: calc(-1 * max(min(1rem, 1vw), min(1rem, 1vh)));
			}

			:host([boundToWindow]) md-dialog::part(dialog) {
				max-height: 100vh !important;
				max-height: 100dvh !important;
				max-width: 100vw !important;
			}

			:host([boundToWindow]) mo-page {
				--mo-page-gap: 0;
			}

			:host([boundToWindow]) #content {
				margin-inline: var(--_margin-alteration);
			}

			:host([boundToWindow]) #footer {
				position: sticky;
				inset-block-end: 0;
				inset-inline: 0;
				background: var(--mo-color-background);
				border-block-start: 1px solid var(--mo-color-transparent-gray-3);
				margin-inline: var(--_margin-alteration);
				margin-block-end: var(--_margin-alteration);
				z-index: 10;
			}

			:host([boundToWindow][size=large]) md-dialog {
				--mo-dialog-default-width: 100vw;
				--mo-dialog-default-height: 100vh;
				--mo-dialog-default-height: 100dvh;
			}

			:host([size=large]) md-dialog::part(content) {
				padding-top: 8px;
				padding-bottom: 8px;
			}

			md-dialog {
				--md-dialog-scroll-divider-color: var(--mo-dialog-divider-color, var(--mo-color-transparent-gray-3));
				--md-sys-color-surface-container-high: var(--mo-color-surface);
				border-radius: var(--mo-border-radius);
			}

			:host([size=large]) md-dialog::part(divider) {
				display: inline-flex !important;
			}

			md-dialog::part(scrim) {
				background-color: var(--mo-dialog-scrim-color, var(--mo-dialog-default-scrim-color, rgba(0, 0, 0, 0.5)));
			}

			md-dialog:not([open]) {
				display: none;
			}

			#header {
				padding-block: 14px 10px;
				padding-inline: 24px 12px;
			}

			:host([size=large]) #header {
				padding-bottom: 15px;
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

			#footer {
				padding: 16px;
				gap: 8px;
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
			}

			slot[name=footer] {
				display: flex;
				flex: 1;
				align-items: center;
				gap: 8px;
			}

			md-dialog::part(dialog) {
				height: var(--mo-dialog-height);
				max-height: calc(100vh - 32px);
				max-height: calc(100dvh - 32px);

				width: var(--mo-dialog-width);
				max-width: calc(100vw - 32px);

				justify-content: center;

				box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12);
			}

			@media (max-width: 1024px), (max-height: 768px) {
				md-dialog::part(dialog) {
					max-height: 100vh !important;
					max-height: 100dvh !important;
					max-width: 100vw !important;
				}
			}
		`
	}

	protected get dialogHeading() {
		return this.heading
	}

	protected override get template() {
		return this.boundToWindow ? html`
			<mo-page heading=${this.heading}>
				<slot name='action' slot='action'></slot>
				${this.contentTemplate}
				${this.footerTemplate}
			</mo-page>
		` : html`
			<md-dialog exportparts='scrim' ?open=${this.open} quick
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
			<mo-flex id='header' slot=${this.boundToWindow ? '' : 'headline'} part='header' direction='horizontal'>
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
			${this.boundToWindow || !this.poppable ? html.nothing : html`
				<mo-icon-button icon='launch' ${tooltip(t('Open as Tab'))} @click=${() => this.requestPopup.dispatch()}></mo-icon-button>
			`}
		`
	}

	protected get contentTemplate() {
		return html`
			<form id='content' slot=${this.boundToWindow ? '' : 'content'} part='content' method='dialog'>
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
			<mo-flex id='footer' slot=${this.boundToWindow ? '' : 'actions'} part='footer' direction='horizontal-reversed'>
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
			<mo-loading-button type='raised'>
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