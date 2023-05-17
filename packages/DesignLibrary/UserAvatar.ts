import { html, component, Component, css, nothing, style, join } from '@a11d/lit'
import { Authentication } from '@a11d/lit-application-authentication'
import { BusinessSuiteDialogAuthenticator, User } from './BusinessSuiteDialogAuthenticator.js'

@component('mo-user-avatar')
export class UserAvatar extends Component {
	static override get styles() {
		return css`
			:host {
				padding: 3px 0;
				display: flex;
			}

			mo-avatar {
				place-self: center;
				background: rgba(0, 0, 0, 0.25);
			}

			mo-avatar:hover {
				cursor: pointer;
				background: rgba(0, 0, 0, calc(0.25 * 2));
			}

			li[role=separator] {
				width: 100%;
				height: 1px;
				background: darkgray;
				opacity: 0.3;
			}

			mo-menu {
				color: var(--mo-color-foreground);
			}
		`
	}

	protected override initialized() {
		BusinessSuiteDialogAuthenticator.authenticatedUserStorage.changed.subscribe(() => this.requestUpdate())
	}

	private get user() {
		return BusinessSuiteDialogAuthenticator.authenticatedUserStorage.value as User | undefined
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
			<mo-avatar ${style({ color: 'var(--mo-color-accessible)' })}>
				${this.avatarContentTemplate}
			</mo-avatar>

			<mo-menu .anchor=${this}>
				${join([
					this.avatarTemplate,
					html`<slot></slot>`,
					this.signOutTemplate
				].filter(Boolean), html`<li role='separator'></li>`)}
			</mo-menu>
		`
	}

	private get avatarContentTemplate() {
		return this.user ? this.initials : html`
			<mo-icon-button icon='account_circle' @click=${() => Authentication.authenticateGloballyIfAvailable()}></mo-icon-button>
		`
	}

	private get avatarTemplate() {
		return !BusinessSuiteDialogAuthenticator.authenticatedUserStorage.value ? nothing : html`
			<mo-flex direction='horizontal' gap='20px' style='padding: 15px'>
				<mo-avatar>${this.avatarContentTemplate}</mo-avatar>
				<mo-flex justifyContent='center'>
					<span style='font-size: 16px'>${this.name}</span>
					${!this.user?.email ? nothing : html`<span>${this.user.email}</span>`}
				</mo-flex>
			</mo-flex>

			<li role='separator'></li>
		`
	}

	private get signOutTemplate() {
		return !Authentication.hasAuthenticator() || !this.user ? nothing : html`
			<mo-list-item @click=${() => Authentication.unauthenticate()}>
				<mo-icon icon='exit_to_app'></mo-icon>
				Sign out
			</mo-list-item>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-user-avatar': UserAvatar
	}
}