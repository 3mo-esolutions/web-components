const attached = new WeakMap<HTMLElement, ElementInternals>()

/**
 * The element's `ElementInternals`, attached on first use.
 *
 * `attachInternals()` throws when it is called a second time, so everything which needs internals -
 * form association, custom states, ARIA - takes them from here instead of attaching its own.
 */
export function elementInternals(element: HTMLElement) {
	let internals = attached.get(element)
	if (!internals) {
		internals = element.attachInternals()
		attached.set(element, internals)
	}
	return internals
}