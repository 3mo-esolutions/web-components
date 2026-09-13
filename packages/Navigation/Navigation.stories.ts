import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Directive, directive, html, noChange, PartType, type ElementPart, type PartInfo } from '@a11d/lit'
import type { MaterialIcon } from '@3mo/icon'
import p from './package.json'
import { type INavigation, type NavigationInvocationOptions } from './INavigation.js'
import { type NavigationPresentation } from './NavigationPresentation.js'
import './index.js'

export default {
	title: 'Layout & Containment / Navigation',
	component: 'mo-navigation',
	package: p,
	args: {
		presentations: ['bar', 'drawer'],
		drawerOpen: false,
	},
	argTypes: {
		presentations: { control: 'object' },
		drawerOpen: { control: 'boolean' },
	},
} as Meta

/** Stands in for a router: the story has no application, so the location is the hash and navigating announces itself the way the platform does. */
class StoryLinkDirective extends Directive {
	private path?: string
	private options?: NavigationInvocationOptions

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('storyLink can only be used on an element')
		}
		const element = (partInfo as ElementPart).element
		element.addEventListener('click', () => {
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

const storyLink = directive(StoryLinkDirective)

class StoryNavigation implements INavigation {
	constructor(readonly options: {
		readonly label: string
		readonly icon?: MaterialIcon
		readonly path?: string
		readonly hasSeparator?: boolean
		readonly children?: Array<StoryNavigation>
	}) {
		if (options.path) {
			this.link = linkOptions => storyLink(options.path!, linkOptions)
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

const link = (label: string, path: string, icon?: MaterialIcon, hasSeparator = false) => new StoryNavigation({ label, path, icon, hasSeparator })

const navigations = [
	link('Dashboard', '/', 'dashboard'),
	new StoryNavigation({
		label: 'Reports', icon: 'assessment', children: [
			link('Overview', '/reports'),
			new StoryNavigation({
				label: 'Quarterly', children: [
					link('First quarter', '/reports/quarterly/q1'),
					link('Second quarter', '/reports/quarterly/q2'),
				]
			}),
			link('Annual', '/reports/annual'),
		]
	}),
	new StoryNavigation({
		label: 'Records', icon: 'inventory_2', hasSeparator: true, children: [
			link('Products', '/products'),
			link('Customers', '/customers'),
		]
	}),
	new StoryNavigation({
		label: 'Logistics', icon: 'local_shipping', children: [
			link('Shipments', '/shipments'),
			link('Warehouses', '/warehouses'),
		]
	}),
	link('Settings', '/settings', 'settings'),
	link('Help', '/help', 'help', true),
]

const page = html`
	<mo-flex style='padding: 2rem; gap: 1rem'>
		<mo-heading typography='heading3'>The page</mo-heading>
		<div>The navigation lays the page out beside or beneath itself, so this is what keeps its room.</div>
	</mo-flex>
`

const template = (presentations: Array<NavigationPresentation>, drawerOpen: boolean) => html`
	<mo-navigation style='height: 600px; border: 1px solid var(--mo-color-transparent-gray-3)'
		heading='Business Suite'
		.navigations=${navigations}
		.presentations=${presentations}
		.drawerOpen=${drawerOpen}
	>${page}</mo-navigation>
`

/**
 * The presentation is the first one of `presentations` which fits: the bar as long as its navigations fit
 * its row, and the drawer once they do not. Narrow the canvas to watch it change over.
 */
export const Navigation: StoryObj = {
	render: ({ presentations, drawerOpen }) => template(presentations, drawerOpen),
}

/**
 * With the rail in the order, it takes the range in which the bar no longer fits but the page still has
 * room beside a rail. The rail carries the top level; picking a group shows its destinations in a panel,
 * docked beside the page while both fit and laid over it while they do not.
 */
export const Rail: StoryObj = {
	args: { presentations: ['bar', 'rail', 'drawer'] },
	render: ({ presentations, drawerOpen }) => template(presentations, drawerOpen),
}

/** Every navigation as one tree, over the page. */
export const Drawer: StoryObj = {
	args: { presentations: ['drawer'], drawerOpen: true },
	render: ({ presentations, drawerOpen }) => template(presentations, drawerOpen),
}