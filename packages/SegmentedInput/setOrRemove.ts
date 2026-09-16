/** Sets the attribute, or removes it for `undefined`. */
export function setOrRemove(element: Element, name: string, value: string | undefined) {
	value === undefined ? element.removeAttribute(name) : element.setAttribute(name, value)
}