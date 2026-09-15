import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, state, style } from '@a11d/lit'
import p from './package.json'
import '@3mo/icon'
import '@3mo/icon-button'
import '@3mo/menu'
import '@3mo/popover'
import '@3mo/scroller'
import './index.js'

export default {
	title: 'Buttons & Actions / Chip',
	component: 'mo-chip',
	package: p,
} as Meta

/** A chip on its own is a button: the platform's, with a container drawn around it. */
export const Chip: StoryObj = {
	render: () => html`<mo-chip>Chip</mo-chip>`
}

/**
 * `readonly` renders a plain tag — not focusable, no state layer, nothing to press.
 * This is what a list of attributes should be.
 */
export const ReadonlyTags: StoryObj = {
	render: () => html`
		<mo-chip-group aria-label='Tags'>
			${['Wholesale', 'Export', 'Priority'].map(tag => html`<mo-chip readonly>${tag}</mo-chip>`)}
		</mo-chip-group>
	`
}

/** With a leading icon, and with an avatar rounded by the consumer. */
export const WithLeadingGraphic: StoryObj = {
	render: () => html`
		<mo-chip-group aria-label='People'>
			<mo-chip>
				<mo-icon slot='start' icon='calendar_today'></mo-icon>
				Add to calendar
			</mo-chip>
			<mo-chip>
				<span slot='start' ${style({ display: 'grid', placeItems: 'center', inlineSize: '22px', blockSize: '22px', borderRadius: '50%', background: 'var(--mo-color-accent)', color: 'var(--mo-color-on-accent)', fontSize: '11px' })}>AL</span>
				Ada Lovelace
			</mo-chip>
		</mo-chip-group>
	`
}

/**
 * Filter chips. `selectability='multiple'` lets any number of them be on at once, and the group's
 * `value` is the array of the selected chips' values. A selected chip swaps its leading graphic for
 * a checkmark and announces itself as a pressed button.
 *
 * The group is the only writer of `selected`: a chip asks with a cancelable `requestSelect` before it
 * toggles, the group refuses and rules instead, and its own `change` carries the answer.
 */
export const FilterChips: StoryObj = {
	render: () => html`
		<mo-chip-group selectability='multiple' aria-label='Filter results' .value=${['open']}>
			<mo-chip value='open'>Open orders</mo-chip>
			<mo-chip value='paid'>Paid</mo-chip>
			<mo-chip value='overdue'>Overdue</mo-chip>
			<mo-chip value='archived'>Archived</mo-chip>
		</mo-chip-group>
	`
}

/**
 * `selectability='single'` is the alternative to a segmented button. One chip is always chosen, so the
 * set *is* a radio group — it announces itself as one and its chips as radios. Add `deselectable` to let
 * the choice be taken back, and it becomes a set of toggles instead, which is what it then is.
 */
export const ChoiceChips: StoryObj = {
	render: () => html`
		<mo-chip-group selectability='single' aria-label='View' value='week'>
			<mo-chip value='day'>Day</mo-chip>
			<mo-chip value='week'>Week</mo-chip>
			<mo-chip value='month'>Month</mo-chip>
		</mo-chip-group>
	`
}

/**
 * `removable` adds the remove button and enables Backspace and Delete on the focused chip.
 * `requestRemove` is cancelable and the chip never removes itself — the consumer removes the data
 * and re-renders, which is what keeps a keyed list honest. Focus lands on the chip that took its place.
 */
export const InputChips: StoryObj = {
	render: () => html`<mo-story-input-chips></mo-story-input-chips>`
}

class StoryInputChips extends Component {
	@state() private tags = ['Acme GmbH', 'Berlin', 'Priority', 'Q3']

	protected override get template() {
		return html`
			<mo-chip-group aria-label='Tags'
				@requestRemove=${(e: CustomEvent<{ source: string }>) => this.handleRequestRemove(e)}
			>
				${this.tags.map(tag => html`<mo-chip removable value=${tag}>${tag}</mo-chip>`)}
			</mo-chip-group>
		`
	}

	private handleRequestRemove(e: CustomEvent<{ source: string }>) {
		const value = (e.target as HTMLElement).getAttribute('value')
		this.tags = this.tags.filter(tag => tag !== value)
	}
}

/** Both at once: a chip that is selected by pressing it and removed by its own button. */
export const SelectableAndRemovable: StoryObj = {
	render: () => html`
		<mo-chip-group selectability='single' aria-label='Shortcuts'>
			<mo-chip value='hamburg' removable>Berlin → Hamburg</mo-chip>
			<mo-chip value='munich' removable>Berlin → Munich</mo-chip>
		</mo-chip-group>
	`
}

/**
 * Content in the `action` slot sits outside the chip's button, so pressing it is not pressing the
 * chip — and the chip's state layer stops short of it, because it is not part of the button. That makes
 * the slot right for a second *action* and wrong for a decorative affordance like a dropdown arrow, which
 * belongs in the label, inside the button.
 */
export const WithTrailingActions: StoryObj = {
	render: () => html`
		<mo-chip>
			Saved view
			<mo-icon-button dense slot='action' icon='more_vert'></mo-icon-button>
		</mo-chip>
	`
}

/** A link chip navigates instead of activating. */
export const Link: StoryObj = {
	render: () => html`<mo-chip href='https://www.3mo.de' target='_blank'>3MO</mo-chip>`
}

export const Disabled: StoryObj = {
	render: () => html`
		<mo-chip-group aria-label='States'>
			<mo-chip disabled>Disabled</mo-chip>
			<mo-chip disabled removable>Disabled removable</mo-chip>
		</mo-chip-group>
	`
}

/**
 * The default is Material 3's: outlined, no fill, filled only once selected. Every color, the corner
 * radius and the height are custom properties, so a chip can carry a status or take a filled look
 * without a variant for it.
 */
export const Customized: StoryObj = {
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
	`
}

/** A set that does not wrap belongs in a scroller. */
export const Scrolling: StoryObj = {
	render: () => html`
		<mo-scroller ${style({ maxWidth: '300px' })}>
			<mo-chip-group nowrap selectability='single' aria-label='Views'>
				${['All', 'Open', 'Paid', 'Overdue', 'Archived', 'Drafts'].map(view => html`
					<mo-chip value=${view.toLowerCase()}>${view}</mo-chip>
				`)}
			</mo-chip-group>
		</mo-scroller>
	`
}

customElements.define('mo-story-input-chips', StoryInputChips)

/**
 * The shape a search or booking filter bar takes: a leading chip carrying the count, the applied
 * filters as removable chips, and the rest as chips that open a menu. A chip whose whole body opens a
 * menu needs no API of its own — it is the anchor of a `mo-popover-container`, which is also what
 * Material asks for, since a trailing icon alone is too small a target on a narrow window. Its arrow goes
 * in the `end` slot, inside the button, so the state layer covers the whole chip.
 *
 * The menu owns the answer, not the chip: the chip asks with `requestSelect` and the story refuses it, so
 * picking an option is what fills the chip in and names it, and the first option of each menu clears it.
 */
export const FilterBar: StoryObj = {
	render: () => html`<mo-story-filter-bar></mo-story-filter-bar>`
}

class StoryFilterBar extends Component {
	@state() private applied = ['Nonstop', 'Carry-on included']
	@state() private chosen = new Map<string, string>()

	// The first option of each menu is the one that clears it.
	private static readonly menus = new Map([
		['Airlines', ['Any airline', 'Star Alliance', 'SkyTeam', 'Oneworld']],
		['Times', ['Any time', 'Morning', 'Afternoon', 'Evening']],
		['Price', ['Any price', 'Under 200 €', 'Under 400 €']],
	])

	protected override get template() {
		return html`
			<mo-chip-group aria-label='Filters'>
				<mo-chip>
					<mo-icon slot='start' icon='tune'></mo-icon>
					All filters (${this.applied.length + this.chosen.size})
				</mo-chip>

				${this.applied.map(filter => html`
					<mo-chip selectable selected removable value=${filter}
						@requestRemove=${() => this.applied = this.applied.filter(f => f !== filter)}
					>${filter}</mo-chip>
				`)}

				${[...StoryFilterBar.menus].map(([name, options]) => html`
					<mo-popover-container>
						<mo-chip selectable ?selected=${this.chosen.has(name)}
							@requestSelect=${(e: Event) => e.preventDefault()}
						>
							${this.chosen.get(name) ?? name}
							<mo-icon slot='end' icon='arrow_drop_down'></mo-icon>
						</mo-chip>
						<mo-menu slot='popover'>
							${options.map((option, index) => html`
								<mo-menu-item @click=${() => this.choose(name, index === 0 ? undefined : option)}>
									${option}
								</mo-menu-item>
							`)}
						</mo-menu>
					</mo-popover-container>
				`)}
			</mo-chip-group>
		`
	}

	private choose(name: string, option?: string) {
		const chosen = new Map(this.chosen)
		option === undefined ? chosen.delete(name) : chosen.set(name, option)
		this.chosen = chosen
	}
}

customElements.define('mo-story-filter-bar', StoryFilterBar)

/**
 * A status told as a chip, which is what a board or a data grid column wants: `readonly` so it is a
 * label rather than a control, coloured through the same two properties everything else uses, and
 * shrunk with a plain `min-height`, because an outer rule beats the chip's own — only what varies with
 * its state needs a custom property.
 *
 * The last one is the editable case — the status is a menu away, so the chip is not `readonly` and
 * carries the affordance that says so.
 */
export const StatusChips: StoryObj = {
	render: () => html`<mo-story-status-chips></mo-story-status-chips>`
}

class StoryStatusChips extends Component {
	private static readonly colorByStatus = new Map([
		['Awaiting payment', 'var(--mo-color-yellow)'],
		['Awaiting pickup', 'var(--mo-color-gray)'],
		['Shipped', 'var(--mo-color-blue)'],
		['Completed', 'var(--mo-color-green)'],
		['Rejected', 'var(--mo-color-red)'],
	])

	@state() private status = 'Awaiting pickup'

	static override get styles() {
		return css`
			mo-chip {
				min-height: 1.5rem;
				border-radius: 100px;
				outline-color: var(--_color);
				color: var(--_color);
				background: color-mix(in srgb, var(--_color), var(--mo-color-surface) 80%);
			}
		`
	}

	private static style(status: string) {
		return style({ '--_color': StoryStatusChips.colorByStatus.get(status)! } as never)
	}

	protected override get template() {
		return html`
			<mo-flex gap='1rem' alignItems='start'>
				<mo-chip-group aria-label='Statuses'>
					${[...StoryStatusChips.colorByStatus.keys()].map(status => html`
						<mo-chip readonly ${StoryStatusChips.style(status)}>${status}</mo-chip>
					`)}
				</mo-chip-group>

				<mo-popover-container>
					<mo-chip ${StoryStatusChips.style(this.status)}>
						${this.status}
						<mo-icon slot='end' icon='arrow_drop_down'></mo-icon>
					</mo-chip>
					<mo-menu slot='popover'>
						${[...StoryStatusChips.colorByStatus.keys()].map(status => html`
							<mo-menu-item @click=${() => this.status = status}>${status}</mo-menu-item>
						`)}
					</mo-menu>
				</mo-popover-container>
			</mo-flex>
		`
	}
}

customElements.define('mo-story-status-chips', StoryStatusChips)