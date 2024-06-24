import { Component, component, property, state, query, css, html, style, event } from '@a11d/lit'
import { type ApplicationTopLayer, DialogActionKey, DialogComponent, type Dialog as IDialog } from '@a11d/lit-application'
import { Dialog } from '@3mo/dialog'

const queryActionElement = (slotName: string) => {
	return (prototype: Component, propertyKey: string) => {
		Object.defineProperty(prototype, propertyKey, {
			get(this: Component) {
				const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name=${slotName}]`)
				return slot?.assignedElements()?.[0] ?? slot?.children[0] ?? undefined
			}
		})
	}
}

@component('mo-business-suite-authentication-dialog')
@DialogComponent.dialogElement()
export class BusinessSuiteAuthenticationDialog extends Component implements IDialog {
	@event({ bubbles: true, composed: true, cancelable: true }) readonly pageHeadingChange!: EventDispatcher<string>

	@property({ updated(this: IDialog) { this.pageHeadingChange.dispatch(this.heading) } }) heading = ''

	@property({
		updated(this: BusinessSuiteAuthenticationDialog, value: boolean) {
			this.style.display = value ? 'block' : 'none'
		}
	}) open = false

	@state({
		updated(this: BusinessSuiteAuthenticationDialog) {
			if (this.primaryActionElement) {
				const PrimaryButtonConstructor = this.primaryActionElement.constructor as Constructor<HTMLElement>
				Dialog.executingActionAdaptersByComponent.get(PrimaryButtonConstructor)?.(this.primaryActionElement, this.executingAction === DialogActionKey.Primary)
			}
		}
	}) executingAction?: DialogActionKey

	readonly preventCancellationOnEscape = true
	readonly primaryOnEnter = true

	@query('lit-application-top-layer') readonly topLayerElement!: ApplicationTopLayer
	@queryActionElement('primaryAction') readonly primaryActionElement!: HTMLElement
	@queryActionElement('secondaryAction') readonly secondaryActionElement!: HTMLElement
	@queryActionElement('cancellationAction') readonly cancellationActionElement!: HTMLElement

	handleAction!: (key: DialogActionKey) => void | Promise<void>

	static override get styles() {
		return css`
			[part=backdrop] {
				display: flex;
				align-items: center;
				justify-content: center;
				position: fixed;
				z-index: 9;
				width: 100%;
				height: 100%;
				inset: 0;
				background: var(--mo-password-manager-accessible-dialog-backdrop, var(--mo-color-background));
			}

			form {
				width: min(calc(100% - 32px), 480px);
				box-shadow: var(--mo-shadow-deep);
				height: min-content;
				background-color: var(--mo-color-surface);
				border-radius: var(--mo-border-radius);
			}

			[part=content] {
				padding: 48px 24px 20px;
			}

			[part=actions] {
				padding: 16px;
			}
		`
	}

	protected override get template() {
		return html`
			<div part='backdrop'>
				<form>
					<div part='content'>
						<slot></slot>
					</div>
					<mo-flex part='actions' ${style({ padding: '16px' })}
						direction='horizontal-reversed'
						gap='var(--mo-thickness-l)'
						alignItems='center'
						justifyContent='space-between'
					>
						<slot name='primaryAction' @click=${() => this.handleAction(DialogActionKey.Primary)}></slot>
						<slot name='footer'></slot>
					</mo-flex>
				</form>
			</div>
			<lit-application-top-layer></lit-application-top-layer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-business-suite-authentication-dialog': BusinessSuiteAuthenticationDialog
	}
}