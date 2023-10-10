import { component, Component, html, property, event, style } from '@3mo/del'
import { Photo } from '../../sdk/index.js'
import { DialogPhoto } from './DialogPhoto.js'

@component('photos-photo-card')
export class PhotoCard extends Component {
	@event() readonly selectionChange!: EventDispatcher<boolean>
	@property({ type: Object }) photo?: Photo
	@property({ type: Boolean, reflect: true }) selected = false

	protected override get template() {
		return !this.photo ? html.nothing : html`
			<style>
				:host {
					height: 100%;
					width: 100%;
				}

				mo-card {
					width: 100%;
					height: 100%;
					transition: var(--mo-duration-quick);
					--mo-card-body-padding: 0px 8px 16px 8px;
				}

				mo-card:hover {
					cursor: pointer;
					transform: scale(1.1, 1.1);
				}

				img {
					border-radius: 50%;
					width: 80%;
					margin: 10% 10% 5% 10%;
					filter: grayscale(1);
				}

				:host([selected]) img {
					filter: grayscale(0);
				}
			</style>
			<mo-card @click=${this.openDialog}>
				<mo-flex ${style({ height: '*' })}>
					<img src=${this.photo.thumbnailUrl} alt=${this.photo.title} @click=${this.selectCard}>
					<mo-flex justifyContent='center' ${style({ height: '*' })}>
						<mo-heading typography='heading5' ${style({ textAlign: 'center', width: '100%', color: 'var(--mo-color-accent)' })}>${this.photo.title}</mo-heading>
					</mo-flex>
				</mo-flex>
			</mo-card>
		`
	}

	private readonly openDialog = async () => {
		if (!this.photo) {
			return
		}

		await new DialogPhoto({ id: this.photo.id }).confirm()
	}

	private readonly selectCard = (event: Event) => {
		event.stopImmediatePropagation()
		this.selected = !this.selected
		this.selectionChange.dispatch(this.selected)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'photos-photo-card': PhotoCard
	}
}