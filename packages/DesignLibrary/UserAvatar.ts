import { html, component, Component, css, join, bind, property, event } from '@a11d/lit'
import { Authentication } from '@a11d/lit-application-authentication'
import { Localizer } from '@3mo/localization'

Localizer.dictionaries.add('de', {
	'Sign out': 'Abmelden'
})

@component('mo-user-avatar')
export class UserAvatar extends Component {
	@event() readonly openChange!: EventDispatcher<boolean>
	@property({ type: Boolean, reflect: true }) open = false

	@property() name?: string
	@property() email?: string

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


	private get initials() {
		return this.name
			?.split(' ')
			.map((s, i, array) => i === array.length - 1 || i === 0 ? s.charAt(0) : '')
			.map(s => s.toUpperCase())
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
				].filter(t => !!t && t !== html.nothing), html`<mo-line></mo-line>`)}
			</mo-menu>
		`
	}

	private get avatarContentTemplate() {
		return this.initials || html`
			<mo-icon-button icon='account_circle' @click=${() => Authentication.authenticateGloballyIfAvailable()}></mo-icon-button>
		`
	}

	private get avatarTemplate() {
		return !this.initials ? html.nothing : html`
			<mo-flex direction='horizontal' gap='20px' style='padding: 15px'>
				<mo-avatar>${this.avatarContentTemplate}</mo-avatar>
				<mo-flex justifyContent='center'>
					<span style='font-size: 16px'>${this.name}</span>
					${!this.email ? html.nothing : html`<span>${this.email}</span>`}
				</mo-flex>
			</mo-flex>
		`
	}

	private get signOutTemplate() {
		return !Authentication.hasAuthenticator() || !this.initials ? html.nothing : html`
			<mo-menu-item icon='exit_to_app' @click=${() => Authentication.unauthenticate()}>
				${t('Sign out')}
			</mo-menu-item>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-user-avatar': UserAvatar
	}
}