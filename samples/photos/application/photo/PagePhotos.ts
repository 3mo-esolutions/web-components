import { PageComponent, component, html, route, state, cache, style, tooltip, contextMenu } from '@3mo/del'
import { type Photo } from '../../sdk/index.js'

const enum Tab {
	Card = 'card',
	DataGrid = 'dataGrid',
}

@route('/:story?', '/web-components/:story?')
@component('photos-page-home')
export class PagePhotos extends PageComponent {
	@state() private photos = new Array<Photo>()
	@state() private selectedPhotos = new Array<Photo>()
	@state() private tab = Tab.DataGrid

	protected override get template() {
		return html`
			<mo-page heading='Startseite' fullHeight>
				<style>
					mo-card {
						min-height: 100px;
						min-width: 100px;
					}

					mo-card::part(header) {
						text-align: center;
					}
				</style>

				<mo-tab-bar slot='action' value=${this.tab} @change=${(e: CustomEvent<Tab>) => this.tab = e.detail}>
					<mo-tab value=${Tab.DataGrid}>DataGrid</mo-tab>
					<mo-tab value=${Tab.Card}>Card</mo-tab>
				</mo-tab-bar>

				${cache(this.tab === Tab.Card ? this.cardTemplate : this.dataGridTemplate)}
			</mo-page>
		`
	}

	private get cardTemplate() {
		return html`
			<mo-flex direction='horizontal' alignItems='center' ${style({ height: '40px' })}>
				<mo-heading typography='heading4' ${style({ color: 'var(--mo-color-accent)', flex: '1' })}>${this.selectedPhotos.length > 0 ? `${this.selectedPhotos.length} Photo${this.selectedPhotos.length > 1 ? 's' : ''} selected` : 'Photos'}</mo-heading>
				${this.selectedPhotos.length === 0 ? html.nothing : html`
					<mo-icon-button icon='edit'
						${tooltip(() => html`
							<mo-card heading='Tooltip'>
								Edit <b>${this.selectedPhotos.length}</b> Photos
							</mo-card>
						`)}
					></mo-icon-button>
					<mo-icon-button icon='delete' ${tooltip('Delete!')}></mo-icon-button>
				`}
			</mo-flex>
			<mo-grid columns='repeat(auto-fit, minmax(200px, 1fr))' gap='6px'>
				${this.photos.slice(0, 50).map(photo => html`
					<photos-photo-card
						.photo=${photo}
						?selected=${this.selectedPhotos.includes(photo)}
						@selectionChange=${(event: CustomEvent<boolean>) => this.updateSelectedPhotos(event.detail, photo)}
						${contextMenu(() => html`
							<mo-context-menu-item icon='edit'>Edit</mo-context-menu-item>
							<mo-context-menu-item icon='delete'>Delete</mo-context-menu-item>
						`)}
					></photos-photo-card>
				`)}
			</mo-grid>
		`
	}

	private get dataGridTemplate() {
		return html`
			<photos-data-grid-photo selectability='multiple' selectOnClick multipleDetails
				.selectedData=${this.selectedPhotos}
				@dataChange=${(event: CustomEvent<Array<Photo>>) => this.photos = event.detail}
				@selectionChange=${(event: CustomEvent<Array<Photo>>) => this.selectedPhotos = event.detail}
			></photos-data-grid-photo>
		`
	}

	private readonly updateSelectedPhotos = (isSelected: boolean, photo: Photo) => {
		this.selectedPhotos = isSelected
			? [...this.selectedPhotos, photo]
			: this.selectedPhotos.filter(p => p !== photo)
	}
}