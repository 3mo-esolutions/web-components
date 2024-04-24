import { component, html, property, Component, css, styleMap, queryAll, ifDefined, style } from '@a11d/lit'
import { type Flex } from '@3mo/flex'
import { MutationController } from '@3mo/mutation-observer'
import { SplitterItem, type SplitterResizerHost } from './index.js'
import type * as CSS from 'csstype'
import '@3mo/theme'
import { SplitterController } from './SplitterController.js'

/**
 * @element mo-splitter
 *
 * @attr direction
 * @attr gap
 * @attr resizerTemplate
 *
 * @slot
 */
@component('mo-splitter')
export class Splitter extends Component {
	private static readonly itemSlotPrefix = 'item-'

	@property() direction: Flex['direction'] = 'vertical'
	@property() gap?: CSS.Property.Gap<string>
	@property({ type: Object }) resizerTemplate = html`<mo-splitter-resizer-knob></mo-splitter-resizer-knob>`

	@queryAll('mo-splitter-resizer-host') private readonly resizerElements!: Array<SplitterResizerHost>

	get items() {
		return [...this.children].filter((c): c is SplitterItem => c instanceof SplitterItem)
	}

	protected readonly splitterController = new SplitterController(this, {
		resizerElements: () => this.resizerElements,
		resizingElements: () => this.items,
	})

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

			:host([data-resizing]) {
				user-select: none;
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

	protected override get template() {
		return html`
			<mo-flex wrap='nowrap' direction=${this.direction} gap=${ifDefined(this.gap)} ${style({ height: '100%', width: '100%' })}>
				${this.items.map((item, index) => this.getItemTemplate(item, index))}
			</mo-flex>
		`
	}

	private getItemTemplate(item: SplitterItem, index: number) {
		const styles = {
			'flex': index === this.items.length - 1 || item.size === undefined ? '1 0 0px' : undefined,
			...(this.direction === 'horizontal' || this.direction === 'horizontal-reversed' ? {
				'width': item.size,
				'min-width': item.min,
				'max-width': item.max,
			} : {
				'height': item.size,
				'min-height': item.min,
				'max-height': item.max,
			})
		}
		return html`
			<slot name='${Splitter.itemSlotPrefix}${index}' style=${styleMap(styles)}></slot>
			${this.getResizerHostTemplate(item, index)}
		`
	}

	private getResizerHostTemplate(item: SplitterItem, index: number) {
		return index === this.items.length - 1 ? html.nothing : html`
			<mo-splitter-resizer-host part='resizer-host'
				?locked=${item.locked}
				direction=${this.direction}
			>${this.resizerTemplate}</mo-splitter-resizer-host>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-splitter': Splitter
	}
}