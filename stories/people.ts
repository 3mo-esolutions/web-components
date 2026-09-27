import '@3mo/date-time'
import { countryOf } from './countries.js'

type Generation = 'any' | 'adult' | 'young'

type Location = readonly [street: string, postcode: string, city: string, country: string]

const locations = {
	seattle: ['Pike Street', '98101', 'Seattle', 'US'],
	newYork: ['Wall Street', '10005', 'New York', 'US'],
	berlin: ['Bahnhofstraße', '10119', 'Berlin', 'DE'],
	hamburg: ['Jungfernstieg', '20354', 'Hamburg', 'DE'],
	munich: ['Maximilianstraße', '80539', 'München', 'DE'],
	london: ['Baker Street', 'NW1 6XE', 'London', 'GB'],
	paris: ['Rue des Lilas', '75011', 'Paris', 'FR'],
	stockholm: ['Vasagatan', '111 20', 'Stockholm', 'SE'],
	amsterdam: ['Prinsengracht', '1015', 'Amsterdam', 'NL'],
	madrid: ['Gran Vía', '28013', 'Madrid', 'ES'],
	rome: ['Via del Corso', '00186', 'Roma', 'IT'],
	copenhagen: ['Nyhavn', '1051', 'København', 'DK'],
	vienna: ['Kärntner Straße', '1010', 'Wien', 'AT'],
	kobe: ['Sannomiya-dori', '650-0021', 'Kōbe', 'JP'],
	lagos: ['Balogun Street', '101241', 'Lagos', 'NG'],
	toronto: ['Queen Street West', 'M5V 2T6', 'Toronto', 'CA'],
	melbourne: ['Flinders Lane', '3000', 'Melbourne', 'AU'],
} satisfies Record<string, Location>

type Character = readonly [name: string, occupation: string, age: number, location: Location]

/** People from The 100, Mr. Robot, Life is Strange, Game of Thrones, Firefly, Star Trek, Studio Ghibli and Discworld, each with a job and a home that suits them. */
const characters: ReadonlyArray<Character> = [
	['Clarke Griffin', 'Physician', 26, locations.berlin],
	['Elliot Alderson', 'Security Engineer', 31, locations.newYork],
	['Max Caulfield', 'Photographer', 19, locations.seattle],
	['Arya Stark', 'Courier', 22, locations.london],
	['Malcolm Reynolds', 'Freight Captain', 41, locations.toronto],
	['Bellamy Blake', 'Head of Security', 29, locations.berlin],
	['Darlene Alderson', 'UX Designer', 28, locations.newYork],
	['Chloe Price', 'Tattoo Artist', 20, locations.seattle],
	['Jean-Luc Picard', 'Vineyard Owner', 68, locations.paris],
	['Octavia Blake', 'Martial Arts Instructor', 24, locations.hamburg],
	['Angela Moss', 'Account Manager', 30, locations.newYork],
	['Raven Reyes', 'Aerospace Engineer', 27, locations.munich],
	['Kaylee Frye', 'Mechanic', 25, locations.melbourne],
	['Sansa Stark', 'Estate Manager', 26, locations.london],
	['Tyrell Wellick', 'Chief Technology Officer', 33, locations.stockholm],
	['Warren Graham', 'Research Assistant', 19, locations.seattle],
	['Marcus Kane', 'City Councillor', 52, locations.munich],
	['Zoe Washburne', 'Operations Manager', 39, locations.toronto],
	['Beverly Crusher', 'Chief Medical Officer', 54, locations.toronto],
	['Sophie Hatter', 'Milliner', 18, locations.vienna],
	['John Murphy', 'Bartender', 28, locations.london],
	['Dominique DiPierro', 'Federal Agent', 34, locations.newYork],
	['Victoria Chase', 'Gallery Curator', 20, locations.newYork],
	['Brienne Tarth', 'Bodyguard', 38, locations.london],
	['Inara Serra', 'Diplomat', 33, locations.rome],
	['Geordi La Forge', 'Chief Engineer', 42, locations.seattle],
	['Abigail Griffin', 'Chief Surgeon', 49, locations.berlin],
	['Howl Pendragon', 'Architect', 27, locations.vienna],
	['Kate Marsh', 'Illustrator', 19, locations.seattle],
	['Davos Seaworth', 'Harbour Master', 55, locations.copenhagen],
	['Monty Green', 'Hydroponics Farmer', 24, locations.hamburg],
	['Phillip Price', 'Chief Executive Officer', 64, locations.newYork],
	['Simon Tam', 'Trauma Surgeon', 29, locations.melbourne],
	['Deanna Troi', 'Counsellor', 40, locations.amsterdam],
	['Moist von Lipwig', 'Postmaster General', 34, locations.london],
	['Charmaine Diyoza', 'Logistics Director', 45, locations.madrid],
	['Joyce Price', 'Diner Owner', 47, locations.seattle],
	['Tormund Giantsbane', 'Mountain Guide', 44, locations.stockholm],
	['River Tam', 'Mathematician', 18, locations.melbourne],
	['Samuel Vimes', 'Police Commissioner', 52, locations.london],
	['Jasper Jordan', 'Chemistry Student', 22, locations.hamburg],
	['Chihiro Ogino', 'Bathhouse Clerk', 17, locations.kobe],
	['Esmeralda Weatherwax', 'Herbalist', 71, locations.amsterdam],
	['Wells Jaha', 'Software Engineer', 25, locations.lagos],
]

const adults = characters.filter(([, , age]) => age >= 30)

const firstNames = [
	'Octavia', 'Bellamy', 'Clarke', 'Raven', 'Lexa', 'Indra', 'Echo', 'Madi', 'Elliot', 'Darlene',
	'Angela', 'Tyrell', 'Max', 'Chloe', 'Warren', 'Kate', 'Arya', 'Sansa', 'Davos', 'Zoe',
	'Kaylee', 'Inara', 'River', 'Simon', 'Beverly', 'Geordi', 'Deanna', 'Kiki', 'Sophie', 'Chihiro',
	'Tiffany', 'Esmeralda', 'Moist', 'Samuel',
]

const lastNames = [
	'Blake', 'Griffin', 'Reyes', 'Kane', 'Jaha', 'Alderson', 'Wellick', 'Moss', 'Caulfield', 'Price',
	'Graham', 'Marsh', 'Stark', 'Tarth', 'Seaworth', 'Reynolds', 'Washburne', 'Frye', 'Serra', 'Tam',
	'Picard', 'Crusher', 'La Forge', 'Troi', 'Hatter', 'Ogino', 'Aching', 'Weatherwax', 'Vimes',
]

const occupations = [...new Set(characters.map(([, occupation]) => occupation))]

const places = Object.values(locations)

const youngAges = [16, 13, 21, 8, 17, 11, 19, 6, 22, 14]

/** A person with a job, a home and a bank balance; a parent carries their children. */
export class Person {
	private static count = 0

	/**
	 * The characters first, then made-up combinations of their names.
	 * A grid keys selection and details by identity, so generate people into a constant, never inside a template.
	 */
	static generate(count: number, generation: Generation = 'any') {
		return Array.from({ length: count }, (_, position) => Person.next(generation, position))
	}

	/** Parents of two or three children, some of whom have children of their own. */
	static generateFamilies(count: number) {
		return Array.from({ length: count }, (_, family) => Person.next('adult', family, undefined,
			parent => Array.from({ length: 2 + family % 2 }, (_, child) => Person.next('young', child, parent.lastName,
				grandparent => Array.from({ length: child % 3 }, (_, grandchild) => Person.next('young', grandchild, grandparent.lastName))
			))
		))
	}

	static generateLargeFamilies(count: number, childrenPerFamily: number) {
		return Array.from({ length: count }, (_, family) => Person.next('adult', family, undefined,
			parent => Array.from({ length: childrenPerFamily }, (_, child) => Person.next('young', child, parent.lastName))
		))
	}

	private static next(generation: Generation, position: number, lastName?: string, childrenOf?: (parent: Person) => Array<Person>) {
		const index = Person.count++
		const character = generation === 'any' ? characters[position]
			: generation === 'adult' ? adults[position % adults.length]
				: undefined
		const [name, occupation, age, [street, postcode, city, countryCode]] = character ?? [
			`${firstNames[index % firstNames.length]} ${lastName ?? lastNames[index * 7 % lastNames.length]}`,
			generation === 'young' ? 'Student' : occupations[index % occupations.length]!,
			generation === 'young' ? youngAges[index % youngAges.length]! : 16 + index * 37 % 56,
			places[index * 5 % places.length]!,
		] as Character
		const country = countryOf(countryCode)
		const person = new Person({
			id: 1001 + index,
			name,
			occupation,
			age,
			birthDate: Person.birthDate(age, index * 53 % 360),
			email: `${name.normalize('NFD').replace(/[^A-Za-z ]/g, '').toLowerCase().split(' ').join('.')}@example.com`,
			phone: `+${country.phone.split('-')[0]} 555 ${1000 + index * 7919 % 9000}`,
			address: `${1 + index * 37 % 240} ${street}, ${postcode} ${city}, ${country.label}`,
			city,
			country: countryCode,
			balance: index % 7 === 3 ? 0 : (index * 137 % 41 - 12) * 75,
		})
		return !childrenOf ? person : new Person({ ...person, children: childrenOf(person) })
	}

	private static birthDate(yearsAgo: number, daysAgo: number) {
		const date = new Date()
		date.setFullYear(date.getFullYear() - yearsAgo)
		date.setDate(date.getDate() - daysAgo)
		return new DateTime(date.toISOString().slice(0, 10))
	}

	readonly id!: number
	readonly name!: string
	readonly occupation!: string
	readonly age!: number
	readonly birthDate!: DateTime
	readonly email!: string
	readonly phone!: string
	readonly address!: string
	readonly city!: string
	/** The ISO 3166 code of one of the `countries`. */
	readonly country!: string
	readonly balance!: number
	readonly children?: Array<Person>

	get firstName() { return this.name.split(' ')[0]! }
	get lastName() { return this.name.split(' ').slice(1).join(' ') }

	constructor(init?: Partial<Person>) {
		Object.assign(this, init)
	}
}

/** Every character once. */
export const people = Person.generate(characters.length)
export const fivePeople = Person.generate(5)
export const twentyPeople = Person.generate(20)
export const fiftyPeople = Person.generate(50)
export const hundredPeople = Person.generate(100)
export const thousandPeople = Person.generate(1000)
export const fiveFamilies = Person.generateFamilies(5)
export const twentyFiveLargeFamilies = Person.generateLargeFamilies(25, 40)