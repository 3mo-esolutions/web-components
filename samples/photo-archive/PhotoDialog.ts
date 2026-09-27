import { component, FetchableDialogComponent, html, type EntityId } from '@3mo/del'
import { countryOf, flag } from '../../stories/index.js'
import { Photo } from './Photo.js'

/** Fetches a photo and shows it with its album, photographer, date and size. */
@component('recipe-photo-dialog')
export class PhotoDialog extends FetchableDialogComponent<Photo | undefined> {
	protected override entity: Photo | undefined = undefined

	protected override fetch(id: EntityId) {
		return Photo.get(Number(id))
	}

	protected override get template() {
		const photo = this.entity
		const photographer = photo?.album.photographer
		return html`
			<mo-fetchable-dialog heading=${photo?.title ?? ''} size='medium'>
				${!photo ? html.nothing : html`
					<mo-flex gap='16px'>
						<img src=${photo.url} alt=${photo.title} style='width: 100%; max-height: 50vh; object-fit: contain; border-radius: var(--mo-border-radius)'>
						<mo-key-value-list>
							<mo-key-value key='Album' value=${photo.album.title}></mo-key-value>
							<mo-key-value key='Photographer' value=${photo.album.owner}></mo-key-value>
							<mo-key-value key='Based in'>
								${!photographer ? html.nothing : html`
									<img src=${flag(photographer.country, 20)} alt='' height='12'>
									${photographer.city}, ${countryOf(photographer.country).label}
								`}
							</mo-key-value>
							<mo-key-value key='Taken' value=${photo.takenAt.format({ dateStyle: 'long' })}></mo-key-value>
							<mo-key-value key='Dimensions' value=${photo.dimensions}></mo-key-value>
						</mo-key-value-list>
					</mo-flex>
				`}
			</mo-fetchable-dialog>
		`
	}
}