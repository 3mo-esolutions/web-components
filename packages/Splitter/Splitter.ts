import { component, html, property, Component, css, styleMap, style } from '@a11d/lit'
import { type Flex } from '@3mo/flex'
import { MutationController } from '@3mo/mutation-observer'
import { SplitterItem } from './index.js'
import '@3mo/theme'

/**
 * @element mo-splitter
 *
 * @attr direction
 * @attr resizerTemplate
 *
 * @slot
 */
@component('mo-splitter')
export class Splitter extends Component {
	private static readonly itemSlotPrefix = 'item-'

	@property() direction: Flex['direction'] = 'vertical'
	@property({ type: Object }) resizerTemplate = html`<mo-splitter-resizer-knob></mo-splitter-resizer-knob>`

	@property({ type: Boolean, reflect: true }) protected resizing = false

	/** What resizing measures once, at its start, so that following the pointer reads no layout. */
	private resize?: { readonly item: SplitterItem, readonly edge: number, readonly extent: number }

	get items() {
		return [...this.children].filter((c): c is SplitterItem => c instanceof SplitterItem)
	}

	protected readonly mutationController = new MutationController(this, {
		config: { childList: true },
		callback: () => {
			this.items.forEach((item, index) => item.slot = `${Splitter.itemSlotPrefix}${index}`)
			this.requestUpdate()
		}
	})

	static override get styles() {
		return css`
			:host {
				display: block;
			}

			:host([resizing]) {
				user-select: none;
				pointer-events: none;
			}

			slot {
				display: block;
				position: relative;
			}

			mo-splitter-resizer-host {
				z-index: 1;
			}
		`
	}

	private startResizing(item: SplitterItem) {
		const { left, top, right, bottom } = item.getBoundingClientRect()
		const { width, height } = this.getBoundingClientRect()
		const edges = { 'horizontal': left, 'horizontal-reversed': right, 'vertical': top, 'vertical-reversed': bottom }
		const horizontal = this.direction === 'horizontal' || this.direction === 'horizontal-reversed'
		this.resize = { item, edge: edges[this.direction], extent: horizontal ? width : height }
		this.resizing = true
	}

	private resizeTo({ x, y }: { readonly x: number, readonly y: number }) {
		const resize = this.resize
		if (!resize) {
			return
		}
		const size = this.direction === 'horizontal' ? x - resize.edge
			: this.direction === 'horizontal-reversed' ? resize.edge - x
				: this.direction === 'vertical' ? y - resize.edge
					: resize.edge - y
		resize.item.size = `${size / resize.extent * 100}%`
	}

	private stopResizing() {
		this.resize = undefined
		this.resizing = false
	}

	protected override get template() {
		return html`
			<mo-flex wrap='nowrap' direction=${this.direction} ${style({ height: '100%', width: '100%' })}>
				${this.items.map((item, index) => this.getItemTemplate(item, index))}
			</mo-flex>
		`
	}

	private getItemTemplate(item: SplitterItem, index: number) {
		const sizeProp = this.direction === 'horizontal' || this.direction === 'horizontal-reversed' ? 'width' : 'height'
		const styles = {
			'flex': item.collapsed ? undefined : index === this.items.length - 1 || item.size === undefined ? '1' : undefined,
			[sizeProp]: item.collapsed ? '0' : (item.size ?? 'fit-content'),
			[`min-${sizeProp}`]: item.collapsed ? 'min-content' : item.min ?? 'min-content',
		}
		return html`
			<slot name=${`${Splitter.itemSlotPrefix}${index}`} style=${styleMap(styles)}></slot>
			${this.getResizerHostTemplate(item, index)}
		`
	}

	private getResizerHostTemplate(item: SplitterItem, index: number) {
		return index === this.items.length - 1 ? html.nothing : html`
			<mo-splitter-resizer-host part='resizer-host'
				?collapsed=${item.collapsed}
				direction=${this.direction}
				@resizeStart=${() => this.startResizing(item)}
				@resize=${(event: CustomEvent<{ readonly x: number, readonly y: number }>) => this.resizeTo(event.detail)}
				@resizeStop=${() => this.stopResizing()}
			>${this.resizerTemplate}</mo-splitter-resizer-host>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter': Splitter
	}
}