import { html, component, Component, css, join, bind, property, event } from '@a11d/lit'
import { Authentication } from '@a11d/lit-application-authentication'
import { BusinessSuiteAuthenticationDialogComponent, User } from './BusinessSuiteAuthenticationDialogComponent.js'

@component('mo-user-avatar')
export class UserAvatar extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>
	@property({ type: Boolean, reflect: true }) open = false

	static override get styles() {
		return css`
			:host {
				padding: 3px 0;
				display: flex;
			}

			mo-avatar {
				place-self: center;
				color: var(--mo-color-accessible);
				background: rgba(0, 0, 0, 0.25);
			}

			mo-avatar:hover {
				cursor: pointer;
				background: rgba(0, 0, 0, calc(0.25 * 2));
			}

			mo-menu {
				color: var(--mo-color-foreground);
			}
		`
	}

	protected override initialized() {
		BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.changed.subscribe(() => this.requestUpdate())
	}

	private get user() {
		return BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value as User | undefined
	}

	private get name() {
		return this.user?.name?.split(' ').map(string => string.charAt(0).toUpperCase() + string.slice(1)).join(' ')
	}

	private get initials() {
		return this.name
			?.split(' ')
			.map((s, i, array) => i === array.length - 1 || i === 0 ? s.charAt(0) : '')
			.join('')
	}

	protected override get template() {
		return html`
			<mo-avatar id='avatar'>
				${this.avatarContentTemplate}
			</mo-avatar>

			<mo-menu fixed target='avatar' .anchor=${this} ?open=${bind(this, 'open', { sourceUpdated: value => this.openChange.dispatch(value) })}>
				${join([
					this.avatarTemplate,
					html`<slot></slot>`,
					this.signOutTemplate
				].filter(Boolean), html`<mo-line></mo-line>`)}
			</mo-menu>
		`
	}

	private get avatarContentTemplate() {
		return this.user ? this.initials : html`
			<mo-icon-button icon='account_circle' @click=${() => Authentication.authenticateGloballyIfAvailable()}></mo-icon-button>
		`
	}

	private get avatarTemplate() {
		return !BusinessSuiteAuthenticationDialogComponent.authenticatedUserStorage.value ? html.nothing : html`
			<mo-flex direction='horizontal' gap='20px' style='padding: 15px'>
				<mo-avatar>${this.avatarContentTemplate}</mo-avatar>
				<mo-flex justifyContent='center'>
					<span style='font-size: 16px'>${this.name}</span>
					${!this.user?.email ? html.nothing : html`<span>${this.user.email}</span>`}
				</mo-flex>
			</mo-flex>
		`
	}

	private get signOutTemplate() {
		return !Authentication.hasAuthenticator() || !this.user ? html.nothing : html`
			<mo-menu-item @click=${() => Authentication.unauthenticate()}>
				<mo-icon icon='exit_to_app'></mo-icon>
				Sign out
			</mo-menu-item>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-user-avatar': UserAvatar
	}
}