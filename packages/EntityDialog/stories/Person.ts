import type { EntityId } from '@3mo/fetchable-dialog'
import { people, respond } from '../../../stories/index.js'

/** A person, kept in memory the way a server would keep it. */
export class Person {
	private static people = people.slice(0, 12).map(({ id, name, age, city }) => new Person({ id, name, age, city }))

	static getAll() {
		return respond(Person.people.map(person => new Person(person)))
	}

	static get(id: EntityId) {
		return respond(new Person(Person.people.find(person => person.id === Number(id))))
	}

	static save(person: Person) {
		const saved = new Person({ ...person, id: person.id ?? Math.max(0, ...Person.people.map(p => p.id!)) + 1 })
		Person.people = Person.people.some(p => p.id === saved.id)
			? Person.people.map(p => p.id === saved.id ? saved : p)
			: [...Person.people, saved]
		return respond(saved)
	}

	static delete(...removed: Array<Person>) {
		Person.people = Person.people.filter(p => !removed.some(person => person.id === p.id))
		return respond(undefined)
	}

	id?: number
	name = ''
	age?: number
	city = ''

	constructor(init?: Partial<Person>) {
		Object.assign(this, init)
	}

	toString() {
		return 'Person'
	}
}