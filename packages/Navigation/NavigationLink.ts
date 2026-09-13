import { html, type DirectiveResult } from '@a11d/lit'
import { routerLink, type RoutableComponent, NavigationStrategy } from '@a11d/lit-application'
import { type INavigation, type NavigationInvocationOptions, type NavigationOptions } from './INavigation.js'

type RouterLinkParameters = Exclude<Parameters<typeof routerLink>[0], RoutableComponent>

/**
 * A destination of the application's router.
 *
 * Almost everything it reports is derived rather than stored: the label falls back to the component's
 * own `label` metadata, `current` is answered by the router per read, and `link` hands `routerLink` the
 * whole parameter set. Applications subclass it to layer their own gates onto `hidden` and `icon`.
 */
export class NavigationLink implements INavigation {
	constructor(readonly options: NavigationOptions & RouterLinkParameters) { }

	get label() {
		const value = this.options.label ?? label.get(this.options.component.constructor as Constructor<any>)
		const appendedEllipsis = (this.options.navigationStrategy ?? NavigationStrategy.Page) === NavigationStrategy.Page ? '' : ' ...'
		return html`${value}${appendedEllipsis}`
	}

	get icon() { return this.options.icon }
	get hidden() { return this.options.hidden ?? false }
	get hasSeparator() { return this.options.hasSeparator }
	get current() { return this.options.component.urlMatches({ mode: this.options.matchMode }) }
	get routerLinkParameters() { return this.options as RouterLinkParameters }

	link(options?: NavigationInvocationOptions): DirectiveResult {
		return routerLink({
			...this.routerLinkParameters,
			invocationHandler: () => {
				options?.invocationHandler?.()
				this.routerLinkParameters.invocationHandler?.()
			}
		})
	}
}