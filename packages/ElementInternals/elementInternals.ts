const attached = new WeakMap<HTMLElement, ElementInternals>()

/**
 * The element's `ElementInternals`, attached on first use. `attachInternals()` throws on a second call,
 * so everything which needs internals - form association, custom states, ARIA - takes them from here.
 */
export function elementInternals(element: HTMLElement) {
	let internals = attached.get(element)
	if (!internals) {
		internals = element.attachInternals()
		attached.set(element, internals)
	}
	return internals
}