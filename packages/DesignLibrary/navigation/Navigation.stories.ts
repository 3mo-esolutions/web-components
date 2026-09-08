import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import type { RoutableComponent } from '@a11d/lit-application'
import type { MaterialIcon } from '@3mo/icon'
import p from '../package.json'
import { NavigationGroup, NavigationLink } from './INavigation.js'
import '../index.js'

export default {
	title: 'Layout & Containment / Navigation',
	component: 'mo-navigation',
	package: p,
	args: {
		drawerOpen: true,
	},
	argTypes: {
		drawerOpen: { control: 'boolean' },
	},
} as Meta

// The navigation takes its heading from the application's manifest, which a story has no application to have.
const globalObject = globalThis as { manifest?: unknown }
globalObject.manifest ??= { short_name: 'Business Suite' }

/**
 * Stands in for a page: the story has no router, so the location is a variable, and navigating announces
 * itself the way the platform does — which is what every `routerLink` in the tree listens for.
 */
class StoryPage {
	constructor(readonly parameters: { readonly path: string }) { }

	get url() { return { path: this.parameters.path } }

	urlMatches() { return this.parameters.path === location.hash.slice(1) }

	navigate() {
		location.hash = this.parameters.path
		window.dispatchEvent(new PopStateEvent('popstate'))
	}
}

const link = (label: string, path: string, icon?: MaterialIcon, hasSeparator = false) => new NavigationLink({
	label,
	icon,
	hasSeparator,
	component: new StoryPage({ path }) as unknown as RoutableComponent<never>,
})

const navigations = [
	link('Dashboard', '/', 'dashboard'),
	new NavigationGroup({
		label: 'Reports', icon: 'assessment', children: [
			link('Overview', '/reports'),
			new NavigationGroup({
				label: 'Quarterly', children: [
					link('First quarter', '/reports/quarterly/q1'),
					link('Second quarter', '/reports/quarterly/q2'),
				]
			}),
			link('Annual', '/reports/annual'),
		]
	}),
	new NavigationGroup({
		label: 'Master data', icon: 'inventory_2', hasSeparator: true, children: [
			link('Products', '/products'),
			link('Customers', '/customers'),
		]
	}),
	link('Settings', '/settings', 'settings'),
	link('Help', '/help', 'help', true),
]

/**
 * The drawer is a tree: a group is a row that opens, a link is a row that navigates, and picking one closes
 * the drawer — the `drawerOpen` control opens it again. The bar itself collapses into a hamburger as a
 * whole once its items no longer fit, so narrow the canvas to see that, and to get the button which opens
 * the drawer the way an application does.
 */
export const Navigation: StoryObj = {
	render: ({ drawerOpen }) => html`
		<mo-navigation style='display: block' .navigations=${navigations} .drawerOpen=${drawerOpen}></mo-navigation>
	`,
}

/**
 * The router marks the row of the page you are on, which the drawer answers by opening its ancestors and
 * putting the cursor on it — so a deep page is on screen the moment the drawer is. This one starts on the
 * first quarter's report, two levels down. From there the arrows walk the tree, Right and Left open and
 * close a group, and typing jumps to a row.
 */
export const CurrentPage: StoryObj = {
	name: 'The page you are on',
	render: ({ drawerOpen }) => {
		location.hash = '/reports/quarterly/q1'
		return html`
			<mo-navigation style='display: block' .navigations=${navigations} .drawerOpen=${drawerOpen}></mo-navigation>
		`
	},
}