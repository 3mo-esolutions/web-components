import { type Element, elementsByPackage } from './elements.ts'
import { hydrate, type HydrationResult } from './hydrate.ts'
import { render, type RenderResult } from './render.ts'

export interface Verdict {
	readonly render: RenderResult
	/** Absent where the element did not render. */
	readonly hydration?: HydrationResult
	/** Whether it renders on the server and hydrates to what a client render gives. */
	readonly supported: boolean
	/** Where it fails, if it does. */
	readonly reason?: string
}

const verdictsByPackage = new Map<string, Promise<Map<string, Verdict>>>()

/** Renders and hydrates the element with the rest of its package, each package once however many of its elements are asked for. */
export async function verdictOf(element: Element) {
	let verdicts = verdictsByPackage.get(element.package)
	if (!verdicts) {
		verdicts = verdictsOfPackage(elementsByPackage.get(element.package)!)
		verdictsByPackage.set(element.package, verdicts)
	}
	return (await verdicts).get(element.tag)!
}

async function verdictsOfPackage(elements: ReadonlyArray<Element>) {
	const renders = await Promise.all(elements.map(async element => ({ element, render: await render(element) })))
	const rendered = renders.flatMap(({ element, render }) => render.status === 'rendered' ? [{ element, html: render.html! }] : [])
	const hydrations = !rendered.length ? new Map<string, HydrationResult>() : await hydrate(elements[0]!.package, elements[0]!.entryPoint, rendered)
	return new Map(renders.map(({ element, render }) => {
		const hydration = hydrations.get(element.tag)
		const supported = hydration?.status === 'hydrated'
		const reason = supported ? undefined
			: render.status !== 'rendered' ? `does not render (${render.status}${!render.error ? '' : `: ${render.error}`})`
				: `does not hydrate identically (${hydration?.status ?? 'not hydrated'}${!hydration?.error ? '' : `: ${hydration.error}`})`
		return [element.tag, { render, hydration, supported, reason } satisfies Verdict] as const
	}))
}
