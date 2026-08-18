import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { action } from 'storybook/actions'
import { html } from '@a11d/lit'
import p from './package.json'
import { CommandPalette, CommandPaletteDataSource, type CommandPaletteData } from './index.js'
import type { MaterialIcon } from '@3mo/icon/MaterialIcon.js'

export default {
	title: 'Selection & Input / Command Palette',
	component: 'mo-command-palette',
	package: p,
} as Meta

const commandExecuted = action('command')
const paletteToggled = action('toggle')

const latency = (milliseconds: number) => new Promise(r => setTimeout(r, milliseconds))

// Data sources register themselves globally, so they are declared once at module scope rather than per render.

interface Page {
	readonly name: string
	readonly path: string
	readonly icon: MaterialIcon
}

@CommandPalette.dataSource()
class PageDataSource extends CommandPaletteDataSource<Page> {
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
			command: () => commandExecuted({ source: this.name, navigateTo: page.path }),
		}
	}
}

interface Customer {
	readonly id: number
	readonly name: string
	readonly company: string
}

@CommandPalette.dataSource()
class CustomerDataSource extends CommandPaletteDataSource<Customer> {
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

	// A deliberately slow source to demonstrate the throttled fetching state of the palette.
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
			command: () => commandExecuted({ source: this.name, openCustomer: customer.id }),
		}
	}

	// Offers a "create" button in the palette's footer, but only once a name has been typed.
	override getNewItem(keyword?: string): CommandPaletteData | undefined {
		return !keyword?.trim() ? undefined : {
			icon: 'person_add',
			label: `Create customer "${keyword}"`,
			command: () => commandExecuted({ source: this.name, createCustomer: keyword }),
		}
	}
}

interface Command {
	readonly label: string
	readonly icon: MaterialIcon
	readonly shortcut?: string
}

@CommandPalette.dataSource()
class ActionDataSource extends CommandPaletteDataSource<Command> {
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
			command: () => commandExecuted({ source: this.name, execute: command.label }),
		}
	}
}

// The decorator registers each source on the palette; the classes are not referenced any further.
void [PageDataSource, CustomerDataSource, ActionDataSource]

export const _CommandPalette: StoryObj = {
	render: () => html`
		<mo-flex gap='24px' @toggle=${(e: ToggleEvent) => paletteToggled(e.newState)}>
			<mo-flex direction='horizontal' alignItems='center' gap='6px' style='flex-wrap: wrap'>
				<span>Press</span>
				<mo-key>Meta+P</mo-key>
				<span>or</span>
				<mo-key>Meta+K</mo-key>
				<span>to search across pages, customers and actions. Executed commands are reported in the »Actions« panel.</span>
			</mo-flex>
			<mo-command-palette-button></mo-command-palette-button>
		</mo-flex>
	`
}

export const OnAnAccentBar: StoryObj = {
	render: () => html`
		<mo-flex gap='24px'>
			<span>
				The button derives its colors from the inherited one, so it adapts to the surface it is placed on
				instead of assuming an accent-colored app bar.
			</span>
			<mo-flex direction='horizontal' alignItems='center' gap='16px'
				style='background: var(--mo-color-accent); color: var(--mo-color-on-accent); padding: 10px 16px; border-radius: var(--mo-border-radius)'>
				<mo-icon icon='menu'></mo-icon>
				<span style='font-weight: 500'>Nordwind</span>
				<div style='flex: 1'></div>
				<mo-command-palette-button></mo-command-palette-button>
			</mo-flex>
			<mo-flex direction='horizontal' alignItems='center' gap='16px'
				style='background: var(--mo-color-surface-container-high); padding: 10px 16px; border-radius: var(--mo-border-radius)'>
				<mo-icon icon='menu'></mo-icon>
				<span style='font-weight: 500'>Nordwind</span>
				<div style='flex: 1'></div>
				<mo-command-palette-button></mo-command-palette-button>
			</mo-flex>
		</mo-flex>
	`
}

export const OpenedProgrammatically: StoryObj = {
	render: () => html`
		<mo-flex gap='24px' alignItems='start'>
			<span>The palette can also be opened from anywhere through <code>CommandPalette.open()</code>.</span>
			<mo-button type='filled' @click=${() => CommandPalette.open()}>Open the command palette</mo-button>
		</mo-flex>
	`
}