import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import '@3mo/icon'
import '@3mo/icon-button'
import '@3mo/menu'
import '@3mo/popover'
import '@3mo/scroller'
import './index.js'

export default {
	title: 'Actions / Chip',
	component: 'mo-chip',
} satisfies Meta

type Story = StoryObj

export const Default: Story = {
	render: () => html`<mo-chip>Chip</mo-chip>`,
}

/** `readonly` renders a plain tag - not focusable, nothing to press - which is what a list of attributes should be. */
export const ReadonlyTags: Story = {
	render: () => html`
		<mo-chip-group aria-label='Tags'>
			<mo-chip readonly>Wholesale</mo-chip>
			<mo-chip readonly>Export</mo-chip>
			<mo-chip readonly>Priority</mo-chip>
		</mo-chip-group>
	`,
}

/** The `start` slot takes a leading icon, or an avatar the consumer rounds. */
export const WithLeadingGraphic: Story = {
	render: () => html`
		<mo-chip-group aria-label='People'>
			<mo-chip>
				<mo-icon slot='start' icon='calendar_today'></mo-icon>
				Add to calendar
			</mo-chip>
			<mo-chip>
				<span slot='start' style='display: grid; place-items: center; inline-size: 22px; block-size: 22px; border-radius: 50%; background: var(--mo-color-accent); color: var(--mo-color-on-accent); font-size: 11px'>AL</span>
				Ada Lovelace
			</mo-chip>
		</mo-chip-group>
	`,
}

/**
 * `selectability='multiple'` lets any number of chips be on, and the group's `value` is the array of their values.
 * The group decides: a chip asks with a cancelable `requestSelect` and a selected one shows a checkmark.
 */
export const FilterChips: Story = {
	render: () => html`
		<mo-chip-group selectability='multiple' aria-label='Filter results' .value=${['open']}>
			<mo-chip value='open'>Open orders</mo-chip>
			<mo-chip value='paid'>Paid</mo-chip>
			<mo-chip value='overdue'>Overdue</mo-chip>
			<mo-chip value='archived'>Archived</mo-chip>
		</mo-chip-group>
	`,
}

/** `selectability='single'` makes the set a radio group, the alternative to a segmented button; `deselectable` lets the choice be taken back. */
export const ChoiceChips: Story = {
	render: () => html`
		<mo-chip-group selectability='single' aria-label='View' value='week'>
			<mo-chip value='day'>Day</mo-chip>
			<mo-chip value='week'>Week</mo-chip>
			<mo-chip value='month'>Month</mo-chip>
		</mo-chip-group>
	`,
}

/**
 * `removable` adds the remove button, and Backspace or Delete on a focused chip. The chip never removes itself:
 * remove the data on `requestRemove` and re-render, and focus moves to the chip that took its place.
 */
export const InputChips: Story = {
	render: () => {
		const [tags, setTags] = useState(['Acme GmbH', 'Berlin', 'Priority', 'Q3'])
		return html`
			<mo-chip-group aria-label='Tags'>
				${tags.map(tag => html`
					<mo-chip removable value=${tag} @requestRemove=${() => setTags(tags.filter(t => t !== tag))}>${tag}</mo-chip>
				`)}
			</mo-chip-group>
		`
	},
}

/** Both at once: a chip selected by pressing it and removed by its own button. */
export const SelectableAndRemovable: Story = {
	render: () => html`
		<mo-chip-group selectability='single' aria-label='Shortcuts'>
			<mo-chip value='hamburg' removable>Berlin → Hamburg</mo-chip>
			<mo-chip value='munich' removable>Berlin → Munich</mo-chip>
		</mo-chip-group>
	`,
}

/**
 * The `action` slot sits outside the chip's button, so pressing it does not press the chip.
 * That suits a second action, not a dropdown arrow, which belongs in `end`.
 */
export const WithTrailingActions: Story = {
	render: () => html`
		<mo-chip>
			Saved view
			<mo-icon-button dense slot='action' icon='more_vert'></mo-icon-button>
		</mo-chip>
	`,
}

/** With `href` the chip is a link that navigates instead of activating. */
export const Link: Story = {
	render: () => html`<mo-chip href='https://www.3mo.de' target='_blank'>3MO</mo-chip>`,
}

/** A disabled chip ignores presses, and so does its remove button. */
export const Disabled: Story = {
	render: () => html`
		<mo-chip-group aria-label='States'>
			<mo-chip disabled>Disabled</mo-chip>
			<mo-chip disabled removable>Disabled removable</mo-chip>
		</mo-chip-group>
	`,
}

/** Outlined by default and filled once selected; an outer rule changes the colors, the corner radius and the height. */
export const Customized: Story = {
	render: () => html`
		<style>
			#filled {
				outline-color: transparent;
				background: var(--mo-color-transparent-gray-3);
			}

			#status {
				outline-color: transparent;
				background: color-mix(in srgb, var(--mo-color-green), transparent 85%);
				color: var(--mo-color-green);
			}

			#pill {
				border-radius: 16px;
				min-height: 30px;
			}
		</style>
		<mo-chip-group aria-label='Customized'>
			<mo-chip>Default</mo-chip>
			<mo-chip id='filled'>Filled</mo-chip>
			<mo-chip id='status'>Active</mo-chip>
			<mo-chip id='pill'>Pill</mo-chip>
		</mo-chip-group>
	`,
}

/** A set that does not wrap belongs in a scroller. */
export const Scrolling: Story = {
	render: () => html`
		<mo-scroller style='max-width: 300px'>
			<mo-chip-group nowrap selectability='single' aria-label='Views'>
				<mo-chip value='all'>All</mo-chip>
				<mo-chip value='open'>Open</mo-chip>
				<mo-chip value='paid'>Paid</mo-chip>
				<mo-chip value='overdue'>Overdue</mo-chip>
				<mo-chip value='archived'>Archived</mo-chip>
				<mo-chip value='drafts'>Drafts</mo-chip>
			</mo-chip-group>
		</mo-scroller>
	`,
}

/**
 * A filter bar: a chip with the count, the applied filters as removable chips and the rest opening menus from a `mo-popover-container`.
 * The story refuses `requestSelect`, so picking an option fills a chip in, and the first option clears it.
 */
export const FilterBar: Story = {
	render: () => {
		const [applied, setApplied] = useState(['Nonstop', 'Carry-on included'])
		const [chosen, setChosen] = useState<Record<string, string | undefined>>({})
		const menus = {
			Airlines: ['Any airline', 'Star Alliance', 'SkyTeam', 'Oneworld'],
			Times: ['Any time', 'Morning', 'Afternoon', 'Evening'],
			Price: ['Any price', 'Under 200 €', 'Under 400 €'],
		}
		return html`
			<mo-chip-group aria-label='Filters'>
				<mo-chip>
					<mo-icon slot='start' icon='tune'></mo-icon>
					All filters (${applied.length + Object.values(chosen).filter(Boolean).length})
				</mo-chip>

				${applied.map(filter => html`
					<mo-chip selectable selected removable value=${filter} @requestRemove=${() => setApplied(applied.filter(f => f !== filter))}>
						${filter}
					</mo-chip>
				`)}

				${Object.entries(menus).map(([name, options]) => html`
					<mo-popover-container>
						<mo-chip selectable ?selected=${!!chosen[name]} @requestSelect=${(event: Event) => event.preventDefault()}>
							${chosen[name] ?? name}
							<mo-icon slot='end' icon='arrow_drop_down'></mo-icon>
						</mo-chip>
						<mo-menu slot='popover'>
							${options.map((option, index) => html`
								<mo-menu-item @click=${() => setChosen({ ...chosen, [name]: index === 0 ? undefined : option })}>${option}</mo-menu-item>
							`)}
						</mo-menu>
					</mo-popover-container>
				`)}
			</mo-chip-group>
		`
	},
}

/**
 * Statuses for a board or a grid column: `readonly`, colored by the same two properties and shrunk with a plain `min-height`.
 * The last one is editable, so it is not `readonly` and carries an arrow.
 */
export const StatusChips: Story = {
	render: () => {
		const colors: Record<string, string> = {
			'Awaiting payment': 'var(--mo-color-yellow)',
			'Awaiting pickup': 'var(--mo-color-gray)',
			'Shipped': 'var(--mo-color-blue)',
			'Completed': 'var(--mo-color-green)',
			'Rejected': 'var(--mo-color-red)',
		}
		const [status, setStatus] = useState('Awaiting pickup')
		return html`
			<style>
				mo-chip.status {
					min-height: 1.5rem;
					border-radius: 100px;
					outline-color: var(--status-color);
					color: var(--status-color);
					background: color-mix(in srgb, var(--status-color), var(--mo-color-surface) 80%);
				}
			</style>
			<mo-flex gap='1rem' alignItems='start'>
				<mo-chip-group aria-label='Statuses'>
					${Object.entries(colors).map(([label, color]) => html`
						<mo-chip readonly class='status' style='--status-color: ${color}'>${label}</mo-chip>
					`)}
				</mo-chip-group>

				<mo-popover-container>
					<mo-chip class='status' style='--status-color: ${colors[status]}'>
						${status}
						<mo-icon slot='end' icon='arrow_drop_down'></mo-icon>
					</mo-chip>
					<mo-menu slot='popover'>
						${Object.keys(colors).map(label => html`
							<mo-menu-item @click=${() => setStatus(label)}>${label}</mo-menu-item>
						`)}
					</mo-menu>
				</mo-popover-container>
			</mo-flex>
		`
	},
}