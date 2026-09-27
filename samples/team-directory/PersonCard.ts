import { Component, component, css, html, NotificationComponent, property } from '@3mo/del'
import { countryOf, flag, type Person } from '../../stories/index.js'
import { PersonDialog } from './PersonDialog.js'

/** A person in the directory, with where they work from, how to reach them and a menu. */
@component('recipe-person-card')
export class PersonCard extends Component {
	@property({ type: Object }) person!: Person

	static override get styles() {
		return css`
			mo-card {
				height: 100%;
			}

			mo-icon {
				color: var(--mo-color-gray);
				font-size: 18px;
			}

			mo-anchor {
				overflow: hidden;
				text-overflow: ellipsis;
			}
		`
	}

	protected override get template() {
		const { firstName, lastName, name, occupation, city, country, email, phone } = this.person
		return html`
			<mo-card type='outlined' heading=${name} subHeading=${occupation} avatar=${`${firstName[0]}${lastName[0]}`.toUpperCase()}>
				<mo-popover-container slot='action'>
					<mo-icon-button icon='more_vert' aria-label='More'></mo-icon-button>
					<mo-menu slot='popover'>
						<mo-menu-item icon='mail' @click=${() => this.copy(email, 'Email address copied')}>Copy email address</mo-menu-item>
						<mo-menu-item icon='call' @click=${() => this.copy(phone, 'Phone number copied')}>Copy phone number</mo-menu-item>
					</mo-menu>
				</mo-popover-container>
				<mo-flex gap='8px'>
					<mo-flex direction='horizontal' alignItems='center' gap='8px'>
						<img src=${flag(country, 20)} alt='' width='18'>
						${city}, ${countryOf(country).label}
					</mo-flex>
					<mo-flex direction='horizontal' alignItems='center' gap='8px'>
						<mo-icon icon='mail'></mo-icon>
						<mo-anchor href='mailto:${email}'>${email}</mo-anchor>
					</mo-flex>
					<mo-flex direction='horizontal' alignItems='center' gap='8px'>
						<mo-icon icon='call'></mo-icon>
						<mo-anchor href='tel:${phone.replaceAll(' ', '')}'>${phone}</mo-anchor>
					</mo-flex>
				</mo-flex>
				<mo-button slot='footer' @click=${() => new PersonDialog({ person: this.person }).confirm()}>View profile</mo-button>
			</mo-card>
		`
	}

	private async copy(text: string, message: string) {
		await navigator.clipboard.writeText(text)
		await NotificationComponent.notifySuccess(message)
	}
}