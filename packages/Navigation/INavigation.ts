import type { DirectiveResult, HTMLTemplateResult } from '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'

/** What an implementation of @see INavigation is given, beyond whatever it derives itself. */
export type NavigationOptions = {
	readonly label?: string | HTMLTemplateResult
	readonly icon?: MaterialIcon
	readonly hidden?: boolean
	readonly hasSeparator?: boolean
}

export type NavigationInvocationOptions = {
	/** Called after the navigation has been invoked, e.g. to close whatever presented it. */
	readonly invocationHandler?: () => void
}

/**
 * A destination, or a group of destinations, as the navigation components present it.
 *
 * It carries no routing of its own — an application implements `link` with whatever makes an element
 * navigate, and reports through `current` which navigation the page being shown belongs to.
 */
export interface INavigation {
	readonly label: string | HTMLTemplateResult
	readonly icon?: MaterialIcon
	/** Whether the navigation shall not be presented at all, e.g. because the user may not reach it. */
	readonly hidden?: boolean
	/** Whether a divider parts this navigation from the one before it. */
	readonly hasSeparator?: boolean
	readonly children?: ReadonlyArray<INavigation>
	/** Whether this navigation, or any of its descendants, is the page being shown. */
	readonly current?: boolean
	/** Applied to the element which invokes this navigation, making it navigate there. */
	link?(options?: NavigationInvocationOptions): DirectiveResult
}

/** The navigations which shall be presented, in the order they were given. */
export const visibleNavigations = (navigations: ReadonlyArray<INavigation> | undefined) => navigations?.filter(n => n.hidden !== true) ?? []