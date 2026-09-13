import { Component, component, css, event, eventListener, html, ifDefined, property, query, repeat, type HTMLTemplateResult } from '@a11d/lit'
import { type Tree } from '@3mo/tree'
import { visibleNavigations, type INavigation } from './INavigation.js'
import './NavigationTreeItem.js'

/**
 * The navigations as a tree of rows: a group is a row which opens, a destination is a row which navigates.
 * The row of the page being shown is revealed, so that a deep destination is on screen right away.
 *
 * @element mo-navigation-tree
 *
 * @attr navigations - The navigations to present.
 * @fires invoke - Dispatched with the destination which was invoked.
 *
 * @csspart tree - The tree holding the rows.
 * @csspart item - Every row of the tree.
 */
@component('mo-navigation-tree')
export class NavigationTree extends Component {
	@event({ bubbles: true, composed: true }) readonly invoke!: EventDispatcher<INavigation>

	@property({ type: Array }) navigations = new Array<INavigation>()

	@query('mo-tree') private readonly treeElement?: Tree

	@eventListener({ target: window, type: 'popstate' })
	protected handleLocationChange() {
		this.requestUpdate()
	}

	override focus(options?: FocusOptions) {
		if (this.treeElement) {
			this.treeElement.focus(options)
		} else {
			super.focus(options)
		}
	}

	private revealedItem?: Element

	protected override updated(...parameters: Parameters<Component['updated']>) {
		super.updated(...parameters)
		const current = this.treeElement?.querySelector('mo-navigation-tree-item[aria-current]') ?? undefined
		if (current && current !== this.revealedItem) {
			this.revealedItem = current
			this.treeElement?.reveal(current as never)
		}
	}

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			mo-tree {
				padding-block: 8px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-tree part='tree'>
				${repeat(visibleNavigations(this.navigations), navigation => navigation, navigation => this.itemTemplate(navigation))}
			</mo-tree>
		`
	}

	private itemTemplate(navigation: INavigation, level = 0): HTMLTemplateResult {
		const children = visibleNavigations(navigation.children)
		return html`
			<mo-navigation-tree-item part='item'
				icon=${ifDefined(level === 0 ? navigation.icon : undefined)}
				.current=${navigation.current === true}
				aria-current=${ifDefined(navigation.current === true && children.length === 0 ? 'page' : undefined)}
				?data-separator=${navigation.hasSeparator === true}
				${navigation.link?.({ invocationHandler: () => this.invoke.dispatch(navigation) }) ?? html.nothing}
			>${navigation.label}${children.map(child => this.itemTemplate(child, level + 1))}</mo-navigation-tree-item>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-navigation-tree': NavigationTree
	}
}