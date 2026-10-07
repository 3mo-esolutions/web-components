import { Directive, directive, noChange, PartType, type ElementPart, type PartInfo } from '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'
import type { INavigation, NavigationInvocationOptions } from '@3mo/navigation'

/** Stands in for a router: the location is the hash, and navigating announces itself the way the platform does. */
class HashLinkDirective extends Directive {
	private path?: string
	private options?: NavigationInvocationOptions

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('hashLink can only be used on an element')
		}
		(partInfo as ElementPart).element.addEventListener('click', () => {
			location.hash = this.path ?? ''
			window.dispatchEvent(new PopStateEvent('popstate'))
			this.options?.invocationHandler?.()
		})
	}

	render(path: string, options?: NavigationInvocationOptions) {
		this.path = path
		this.options = options
		return noChange
	}
}

const hashLink = directive(HashLinkDirective)

/** A destination with a `path`, or a group with `children`, which is current while the location is its path. */
class Navigation implements INavigation {
	constructor(readonly options: {
		readonly label: string
		readonly icon?: MaterialIcon
		readonly path?: string
		readonly hasSeparator?: boolean
		readonly children?: Array<Navigation>
	}) {
		if (options.path) {
			this.link = linkOptions => hashLink(options.path!, linkOptions)
		}
	}

	get label() { return this.options.label }
	get icon() { return this.options.icon }
	get hasSeparator() { return this.options.hasSeparator }
	get children() { return this.options.children }
	get current(): boolean {
		return this.options.path
			? location.hash.slice(1) === this.options.path
			: this.options.children?.some(child => child.current) === true
	}

	readonly link?: INavigation['link']
}

export const navigations = [
	new Navigation({ label: 'Dashboard', path: '/', icon: 'dashboard' }),
	new Navigation({
		label: 'Reports', icon: 'assessment', children: [
			new Navigation({ label: 'Overview', path: '/reports' }),
			new Navigation({
				label: 'Quarterly', children: [
					new Navigation({ label: 'First quarter', path: '/reports/quarterly/q1' }),
					new Navigation({ label: 'Second quarter', path: '/reports/quarterly/q2' }),
				],
			}),
			new Navigation({ label: 'Annual', path: '/reports/annual' }),
		],
	}),
	new Navigation({
		label: 'Records', icon: 'inventory_2', hasSeparator: true, children: [
			new Navigation({ label: 'Products', path: '/products' }),
			new Navigation({ label: 'Customers', path: '/customers' }),
		],
	}),
	new Navigation({
		label: 'Logistics', icon: 'local_shipping', children: [
			new Navigation({ label: 'Shipments', path: '/shipments' }),
			new Navigation({ label: 'Warehouses', path: '/warehouses' }),
		],
	}),
	new Navigation({ label: 'Settings', path: '/settings', icon: 'settings' }),
	new Navigation({ label: 'Help', path: '/help', icon: 'help', hasSeparator: true }),
]
