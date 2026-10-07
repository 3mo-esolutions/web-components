import { action } from 'storybook/actions'
import { CommandPalette, CommandPaletteDataSource, type CommandPaletteData } from '@3mo/command-palette'
import type { MaterialIcon } from '@3mo/icon'

const latency = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

interface Page {
	readonly name: string
	readonly path: string
	readonly icon: MaterialIcon
}

/** Registered by the decorator, which is all a data source needs to appear in the palette. */
@CommandPalette.dataSource()
export class PageDataSource extends CommandPaletteDataSource<Page> {
	private static readonly pages: Array<Page> = [
		{ name: 'Dashboard', path: '/', icon: 'space_dashboard' },
		{ name: 'Orders', path: '/orders', icon: 'receipt_long' },
		{ name: 'Customers', path: '/customers', icon: 'groups' },
		{ name: 'Invoices', path: '/invoices', icon: 'request_quote' },
		{ name: 'Reports', path: '/reports', icon: 'insights' },
		{ name: 'Settings', path: '/settings', icon: 'settings' },
	]

	name = 'Pages'
	icon: MaterialIcon = 'explore'
	override readonly order = 1

	async fetch() {
		await latency(150)
		return PageDataSource.pages
	}

	async search(keyword: string) {
		await latency(150)
		return PageDataSource.pages.filter(page => page.name.toLowerCase().includes(keyword.toLowerCase()))
	}

	getItem(page: Page): CommandPaletteData {
		return {
			icon: page.icon,
			label: page.name,
			secondaryLabel: page.path,
			command: () => action('navigate')(page.path),
		}
	}
}

interface Customer {
	readonly id: number
	readonly name: string
	readonly company: string
}

@CommandPalette.dataSource()
export class CustomerDataSource extends CommandPaletteDataSource<Customer> {
	private static readonly customers: Array<Customer> = [
		{ id: 1, name: 'Alina Weber', company: 'Nordwind Logistik' },
		{ id: 2, name: 'Bruno Kessler', company: 'Kessler & Söhne' },
		{ id: 3, name: 'Carla Mendes', company: 'Atlântico Foods' },
		{ id: 4, name: 'Deniz Aydın', company: 'Marmara Tekstil' },
		{ id: 5, name: 'Emma Lindqvist', company: 'Skandia Design' },
		{ id: 6, name: 'Farid Haddad', company: 'Cedar Trading' },
	]

	name = 'Customers'
	icon: MaterialIcon = 'person'
	override readonly order = 2

	// Slow on purpose, to show the palette's fetching state.
	async fetch() {
		await latency(900)
		return CustomerDataSource.customers
	}

	async search(keyword: string) {
		await latency(900)
		const k = keyword.toLowerCase()
		return CustomerDataSource.customers.filter(c => c.name.toLowerCase().includes(k) || c.company.toLowerCase().includes(k))
	}

	getItem(customer: Customer): CommandPaletteData {
		return {
			icon: this.icon,
			label: customer.name,
			secondaryLabel: customer.company,
			command: () => action('open customer')(customer.id),
		}
	}

	// Offers a "create" button in the palette's footer once a name has been typed.
	override getNewItem(keyword?: string): CommandPaletteData | undefined {
		return !keyword?.trim() ? undefined : {
			icon: 'person_add',
			label: `Create customer "${keyword}"`,
			command: () => action('create customer')(keyword),
		}
	}
}

interface Command {
	readonly label: string
	readonly icon: MaterialIcon
	readonly shortcut?: string
}

@CommandPalette.dataSource()
export class ActionDataSource extends CommandPaletteDataSource<Command> {
	private static readonly commands: Array<Command> = [
		{ label: 'Create invoice', icon: 'note_add', shortcut: 'Meta+N' },
		{ label: 'Export current view as CSV', icon: 'download', shortcut: 'Meta+Shift+E' },
		{ label: 'Toggle dark mode', icon: 'dark_mode' },
		{ label: 'Invite a team member', icon: 'person_add' },
		{ label: 'Sign out', icon: 'logout' },
	]

	name = 'Actions'
	icon: MaterialIcon = 'bolt'
	override readonly order = 3

	async fetch() {
		await latency(300)
		return ActionDataSource.commands
	}

	async search(keyword: string) {
		await latency(300)
		return ActionDataSource.commands.filter(c => c.label.toLowerCase().includes(keyword.toLowerCase()))
	}

	getItem(command: Command): CommandPaletteData {
		return {
			icon: command.icon,
			label: command.label,
			secondaryLabel: command.shortcut,
			command: () => action('execute')(command.label),
		}
	}
}
