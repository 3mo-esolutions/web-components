import { Component, component, css, html } from '@a11d/lit'
import { Selectability } from '@3mo/selectability'
import { TreeController } from '@3mo/tree'

/** A tree of plain `div`s, to which the controller adds the roles, levels, cursor, expansion and selection. */
@component('story-headless-tree')
export class HeadlessTree extends Component {
	override readonly role = 'tree'

	readonly tree = new TreeController<HTMLElement, HeadlessTree>(this, host => ({
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
			/* Drawn rather than written, so that the chevron stays out of the typeahead. */
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
		const item = HeadlessTree.item
		return html`
			${item('Documents', html`${item('Taxes', html`${item('2025.pdf')}${item('2026.pdf')}`)}${item('Notes.md')}`)}
			${item('Pictures', html`${item('Screenshot.png')}`)}
			${item('System', html`${item('kernel')}`, true)}
			${item('Readme.txt')}
		`
	}
}