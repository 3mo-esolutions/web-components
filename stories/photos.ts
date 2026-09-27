import '@3mo/date-time'

/** A photograph at a size, served by Lorem Picsum; the same seed always gives the same picture. */
export const image = (seed: string, width = 800, height = Math.round(width * 3 / 4)) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`

export type Album = { readonly id: number, readonly title: string, readonly owner: string }

export type Photo = {
	readonly id: number
	readonly albumId: number
	readonly title: string
	readonly takenAt: DateTime
	readonly width: number
	readonly height: number
	readonly url: string
	readonly thumbnailUrl: string
}

const collections: ReadonlyArray<readonly [title: string, owner: string, photos: ReadonlyArray<string>]> = [
	['Arcadia Bay', 'Max Caulfield', ['Lighthouse at dusk', 'Two Whales Diner', 'Train tracks', 'The junkyard', 'Blackwell courtyard', 'Bay at noon', 'Butterfly', 'Last light']],
	['Everyday Heroes', 'Max Caulfield', ['Chloe on the roof', 'Warren\'s lab', 'Kate sketching', 'Joyce at the counter', 'Rain on the window']],
	['The Ark', 'Raven Reyes', ['Earthrise', 'Mecha station', 'Hydro farm', 'Launch bay', 'Drop ship', 'First landing']],
	['Serenity', 'Kaylee Frye', ['Engine room', 'Cargo bay', 'Galley dinner', 'Persephone docks', 'Strawberries']],
	['Winterfell', 'Sansa Stark', ['The godswood', 'First snow', 'Great hall', 'Wolf pups', 'Northern road']],
	['Château Picard', 'Jean-Luc Picard', ['Harvest', 'The cellar', 'Vineyard rows', 'Old oak', 'Summer evening']],
	['Moving Castle', 'Sophie Hatter', ['Hat shop', 'Flower field', 'Calcifer', 'Market square', 'Waste lands', 'Castle at sunrise']],
	['Allsafe offsite', 'Angela Moss', ['Coney Island', 'Rooftop', 'Server room', 'Subway', 'Times Square at night']],
]

const sizes: ReadonlyArray<readonly [width: number, height: number]> = [[1200, 800], [800, 1200], [1000, 1000], [1200, 900], [900, 1200], [1200, 675], [800, 1000]]

export const albums: ReadonlyArray<Album> = collections.map(([title, owner], index) => ({ id: index + 1, title, owner }))

/** Every album's photos, the most recent first. */
export const photos: ReadonlyArray<Photo> = collections.flatMap(([album, , titles], albumIndex) => titles.map(title => ({ album, albumId: albumIndex + 1, title })))
	.map(({ album, albumId, title }, index) => {
		const date = new Date()
		date.setDate(date.getDate() - index * 5)
		const seed = `${album}-${title}`
		const [width, height] = sizes[index % sizes.length]!
		return { id: index + 1, albumId, title, takenAt: new DateTime(date.toISOString().slice(0, 10)), width, height, url: image(seed, width, height), thumbnailUrl: image(seed, width / 4, height / 4) }
	})