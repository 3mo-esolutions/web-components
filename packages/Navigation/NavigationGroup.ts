import { type INavigation, type NavigationOptions } from './INavigation.js'

/**
 * A set of destinations presented together, and named by a label of its own.
 *
 * It has no destination and therefore no `link`: it is hidden once everything in it is, and current
 * once anything in it is.
 */
export class NavigationGroup implements INavigation {
	constructor(readonly options: NavigationOptions & { readonly children: Array<INavigation> }) { }

	get label() { return this.options.label ?? '' }
	get icon() { return this.options.icon }
	get hidden() { return this.options.hidden || !this.children.length || this.children.every(child => child.hidden === true) }
	get hasSeparator() { return this.options.hasSeparator }
	get children() { return this.options.children }
	get current() { return this.children.some(child => child.current === true) }
}