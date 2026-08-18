/**
 * The shape of the "custom-elements.json" emitted by the analyzer. Importing the file as JSON infers a vast union
 * of the literal shapes it happens to contain, which cannot be written to, so it is asserted to these types instead.
 */
export interface CustomElementsManifest {
	version: string
	tags: Array<Tag>
}

export interface Tag {
	name: string
	path: string
	description?: string
	attributes?: Array<Member>
	properties?: Array<Member>
	events?: Array<Event>
	slots?: Array<Described>
	cssProperties?: Array<Described>
	cssParts?: Array<Described>
}

export interface Member {
	name: string
	type?: string
	default?: string
	attribute?: string
	description?: string
	deprecatedMessage?: string
}

export interface Event {
	name: string
	type?: string
	description?: string
}

export interface Described {
	name: string
	description?: string
}