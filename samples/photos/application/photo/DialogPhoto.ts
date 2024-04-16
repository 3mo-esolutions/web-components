import { component, FetchableDialogComponent, html, state } from '@3mo/del'
import { type Album, Api, Photo, type User } from '../../sdk/index.js'

@component('photos-photo-details-dialog')
export class DialogPhoto extends FetchableDialogComponent<Photo> {
	protected entity = {} as Photo

	protected fetch = async (id: number) => {
		const photo = await Photo.get(id)
		this.album = await Api.get<Album>(`/albums/${photo.albumId}`)
		this.photographer = await Api.get(`/users/${this.album.userId}`)
		return photo
	}

	@state() private album?: Album
	@state() private photographer?: User

	private get photo() { return this.entity }

	protected override get template() {
		return html`
			<mo-fetchable-dialog heading=${this.photo.title}>
				<style>
					img {
						border-radius: 50%;
						width: 100%;
					}
				</style>
				<mo-flex direction='horizontal' gap='18px'>
					<mo-flex justifyContent='center'>
						<img src=${this.photo.thumbnailUrl} alt=${this.photo.title}>
					</mo-flex>
					<mo-flex gap='var(--mo-thickness-xl)'>
						<mo-meta heading='Album'>${this.album?.title}</mo-meta>
						<mo-meta heading='Photographer'>
							${this.photographer?.name}
							<br>
							@${this.photographer?.username}
						</mo-meta>
						<mo-meta heading='Company'>${this.photographer?.company.name}</mo-meta>
					</mo-flex>
				</mo-flex>
			</mo-fetchable-dialog>
		`
	}
}