import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, component, css, html, state } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import p from './package.json'
import { TreeController } from './TreeController.js'
import type { TreeItem } from './TreeItem.js'
import './index.js'

export default {
	title: 'Data Display / Tree',
	component: 'mo-tree',
	package: p,
	args: {
		selectability: undefined,
	},
	argTypes: {
		selectability: { control: 'select', options: [undefined, 'single', 'multiple'] },
	},
} as Meta

const fileSystem = html`
	<mo-tree-item value='documents' icon='folder' open>
		Documents
		<mo-tree-item value='taxes' icon='folder'>
			Taxes
			<mo-tree-item value='2025.pdf' icon='picture_as_pdf'>2025.pdf</mo-tree-item>
			<mo-tree-item value='2026.pdf' icon='picture_as_pdf'>2026.pdf</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='letters' icon='folder'>
			Letters
			<mo-tree-item value='landlord.docx' icon='description'>Landlord.docx</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='notes.md' icon='description'>Notes.md</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='pictures' icon='folder'>
		Pictures
		<mo-tree-item value='holidays' icon='folder'>
			Holidays
			<mo-tree-item value='beach.jpg' icon='image'>Beach.jpg</mo-tree-item>
			<mo-tree-item value='mountains.jpg' icon='image'>Mountains.jpg</mo-tree-item>
		</mo-tree-item>
		<mo-tree-item value='screenshot.png' icon='image'>Screenshot.png</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='music' icon='folder'>
		Music
		<mo-tree-item value='playlist.m3u' icon='description'>Playlist.m3u</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='system' icon='folder' disabled>
		System
		<mo-tree-item value='kernel' icon='description'>kernel</mo-tree-item>
	</mo-tree-item>
	<mo-tree-item value='readme.txt' icon='description'>Readme.txt</mo-tree-item>
`

const readout = css`
	.readout {
		font-size: small;
		color: var(--mo-color-gray);
		padding: 0.5rem 0.75rem;
		border-block-start: 1px solid var(--mo-color-transparent-gray-3);
		code { color: var(--mo-color-accent); }
	}
`

/**
 * The nesting is the hierarchy; an item's `value`, `open`, `selected` and `disabled` are where the state
 * starts. Without `selectability` a click opens the row; with it, a click selects and the indicator opens.
 */
export const Basic: StoryObj = {
	render: ({ selectability }) => html`
		<mo-tree style='max-width: 24rem' selectability=${selectability ?? ''}>
			${fileSystem}
		</mo-tree>
	`,
}

/**
 * The selection is the tree's `value`, bound like any other value here. What is open is each item's own
 * `open`, bound the same way and reported by its `openChange` — which bubbles, so one listener on the tree
 * hears every row.
 */
@component('story-tree-controlled')
class StoryTreeControlled extends Component {
	@state() private value?: string | Array<string>
	@state() private open = new Set(['documents'])

	static override get styles() { return readout }

	private readonly folders = [
		{ value: 'documents', name: 'Documents', children: [{ value: 'taxes', name: 'Taxes' }, { value: 'letters', name: 'Letters' }] },
		{ value: 'pictures', name: 'Pictures', children: [{ value: 'holidays', name: 'Holidays' }] },
		{ value: 'music', name: 'Music', children: [] },
	]

	protected override get template() {
		return html`
			<mo-tree style='max-width: 24rem' selectability='multiple'
				.value=${this.value}
				@change=${(e: CustomEvent<string | Array<string>>) => this.value = e.detail}
				@openChange=${(e: CustomEvent<boolean>) => {
				const value = (e.target as TreeItem).value!
				this.open = new Set(e.detail ? [...this.open, value] : [...this.open].filter(open => open !== value))
			}}
			>
				${this.folders.map(folder => html`
					<mo-tree-item value=${folder.value} icon='folder' ?open=${this.open.has(folder.value)}>${folder.name}
						${folder.children.map(child => html`<mo-tree-item value=${child.value} icon='folder'>${child.name}</mo-tree-item>`)}
					</mo-tree-item>
				`)}
			</mo-tree>
			<div class='readout'>
				Selected: <code>${[this.value ?? []].flat().join(', ') || 'nothing'}</code><br>
				Open: <code>${[...this.open].join(', ') || 'nothing'}</code>
			</div>
		`
	}
}

StoryTreeControlled

export const Controlled: StoryObj = {
	render: () => html`<story-tree-controlled></story-tree-controlled>`,
}

export const Keyboard: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' gap='2rem' alignItems='flex-start' wrap='wrap'>
			<mo-tree style='min-width: 22rem' selectability='multiple'>${fileSystem}</mo-tree>
			<mo-key-value-list style='font-size: small; min-width: 22rem'>
				<mo-key-value key='↓ ↑'>Next and previous visible item</mo-key-value>
				<mo-key-value key='→'>Open a closed parent, then move into its first child</mo-key-value>
				<mo-key-value key='←'>Close an open parent, then move to the parent</mo-key-value>
				<mo-key-value key='Home  End'>First and last visible item</mo-key-value>
				<mo-key-value key='*'>Open every sibling</mo-key-value>
				<mo-key-value key='Enter'>Click the item</mo-key-value>
				<mo-key-value key='Space'>Toggle the selection</mo-key-value>
				<mo-key-value key='Shift + ↓ ↑'>Extend the selection</mo-key-value>
				<mo-key-value key='Ctrl + A'>Select everything visible</mo-key-value>
				<mo-key-value key='a–z'>Jump to the next item starting with what was typed</mo-key-value>
			</mo-key-value-list>
		</mo-flex>
	`,
}

/**
 * The row is `::part(row)`'s to change — its height, its indentation per level, the guide lines it draws
 * along that indentation — and the group that slides is `::part(group)`'s.
 */
export const Appearance: StoryObj = {
	render: () => html`
		<mo-flex direction='horizontal' gap='2rem' alignItems='flex-start' wrap='wrap'>
			<mo-tree style='min-width: 18rem'>${fileSystem}</mo-tree>
			<mo-tree class='dense' style='min-width: 18rem'>${fileSystem}</mo-tree>
			<mo-tree class='plain' style='min-width: 18rem'>${fileSystem}</mo-tree>
		</mo-flex>
		<style>
			.dense mo-tree-item::part(row) {
				min-block-size: 32px;
				padding-inline-start: calc(var(--mo-tree-level, 0) * 28px);
				background-size: calc(var(--mo-tree-level, 0) * 28px) 100%;
			}
			.plain mo-tree-item::part(row) { background-image: none; }
			.plain mo-tree-item::part(group) { transition: none; }
		</style>
	`,
}

/**
 * The controller alone, on plain `div`s: the host supplies the roots and how to reach an item's children,
 * and the controller stamps roles, levels, cursor, expansion and selection onto them. A different design,
 * the same behaviour — hiding a closed item's children is the host's job, as it is `mo-tree-item`'s.
 */
@component('story-tree-headless')
class StoryTreeHeadless extends Component {
	override readonly role = 'tree'

	private readonly tree = new TreeController<HTMLElement, StoryTreeHeadless>(this, host => ({
		get items() { return [...host.renderRoot.children].filter((child): child is HTMLElement => child.classList.contains('item')) },
		children: item => [...item.querySelectorAll<HTMLElement>(':scope > .children > .item')],
		isDisabled: item => item.hasAttribute('data-disabled'),
		selectability: Selectability.Multiple,
	}))

	static override get styles() {
		return css`
			:host { display: block; max-width: 24rem; font-family: ui-monospace, monospace; font-size: 0.9rem; outline: none; }
			.row {
				display: flex; align-items: center; gap: 0.5rem;
				padding: 0.25rem 0.5rem 0.25rem calc(0.5rem + var(--mo-tree-level, 0) * 1.5rem);
				border-radius: 4px; cursor: default; user-select: none;
			}
			.item { outline: none; }
			.item[data-navigability=current] > .row { box-shadow: inset 0 0 0 2px var(--mo-color-accent); }
			.item[aria-selected=true] > .row { background: color-mix(in srgb, var(--mo-color-accent), transparent 85%); }
			.item[aria-disabled=true] > .row { opacity: 0.4; }
			.item:not([aria-expanded]) > .row > [part=indicator] { visibility: hidden; }
			.item[aria-expanded=true] > .row > [part=indicator] { rotate: 90deg; }
			.item:not([aria-expanded=true]) > .children { display: none; }
			/* The chevron is drawn rather than written, so that it stays out of the typeahead. */
			[part=indicator]::before { content: '▸'; }
			[part=indicator] { width: 1rem; color: var(--mo-color-gray); }
		`
	}

	private static item(name: string, children?: unknown, disabled = false) {
		return html`
			<div class='item' ?data-disabled=${disabled}>
				<div class='row'><span part='indicator'></span><span>${name}</span></div>
				${!children ? html.nothing : html`<div class='children'>${children}</div>`}
			</div>
		`
	}

	protected override get template() {
		const item = StoryTreeHeadless.item
		return html`
			${item('Documents', html`${item('Taxes', html`${item('2025.pdf')}${item('2026.pdf')}`)}${item('Notes.md')}`)}
			${item('Pictures', html`${item('Screenshot.png')}`)}
			${item('System', html`${item('kernel')}`, true)}
			${item('Readme.txt')}
		`
	}
}

StoryTreeHeadless

export const BuildYourOwn: StoryObj = {
	name: 'Build your own (controller only)',
	render: () => html`<story-tree-headless></story-tree-headless>`,
}