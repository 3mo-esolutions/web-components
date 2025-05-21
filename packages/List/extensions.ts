export const list = Symbol('list')

Object.defineProperty(Element.prototype, list, {
	enumerable: false,
	configurable: true,
	get(this: Element) {
		return this.tagName === 'UL' || this.tagName === 'OL' || this.role === 'list' ? this : undefined
	},
})

export const listItem = Symbol('listItem')

Object.defineProperty(Element.prototype, listItem, {
	enumerable: false,
	configurable: true,
	get(this: Element) {
		return this.tagName === 'LI' || (!!this.role && ['listitem', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option'].includes(this.role)) ? this : undefined
	},
})

export const listItems = Symbol('listItems')

Object.defineProperty(Element.prototype, listItems, {
	enumerable: false,
	configurable: true,
	get(this: Element) {
		if (this[listItem]) {
			return [this]
		}

		if (this instanceof HTMLSlotElement) {
			return this.assignedElements({ flatten: true }).flatMap(e => e[listItems] ?? [])
		}

		if (!this[list]) {
			return undefined
		}

		return [...this.children].flatMap(e => e[listItems] ?? [])
	},
})

declare global {
	interface Element {
		readonly [list]?: Element
		readonly [listItem]?: Element
		readonly [listItems]?: Array<Element>
	}
}