import { Component, type PropertyValues, bind, component, css, eventListener, html, query, state } from '@a11d/lit'
import { ApplicationTopLayer } from '@a11d/lit-application'
import { FetcherController } from '@3mo/fetcher-controller'
import type { FieldSearch } from '@3mo/text-fields'
import type { List } from '@3mo/list'
import { type CommandPaletteDataSource } from './CommandPaletteDataSource.js'

@component('mo-command-palette')
export class CommandPalette extends Component {
	static readonly dataSources = new Set<CommandPaletteDataSource<any>>()

	static dataSource = () => {
		return <T>(Constructor: Constructor<CommandPaletteDataSource<T>>) => {
			CommandPalette.dataSources.add(new Constructor())
		}
	}

	private static _instance?: CommandPalette
	private static get instance() { return this._instance ??= new CommandPalette() }

	static {
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			if (['p', 'k'].includes(event.key) && (event.ctrlKey || event.metaKey)) {
				event.preventDefault()
				event.stopImmediatePropagation()
				ApplicationTopLayer.instance.appendChild(CommandPalette.instance)
				CommandPalette.instance.togglePopover()
			}
		})
	}

	static open() {
		ApplicationTopLayer.instance.appendChild(this.instance)
		this.instance.showPopover()
	}

	override popover = 'auto'

	@state({ updated(this: CommandPalette) { this.fetcherController.fetch() } }) keyword = ''
	@state() filteredDataSourceId?: string

	readonly dataSources = [...CommandPalette.dataSources].sort((a, b) => a.order - b.order)

	@query('mo-command-palette-search-field') private readonly searchField!: FieldSearch
	@query('mo-list') private readonly list?: List

	@eventListener({ target: window, type: 'keydown' })
	protected handleKeyDown(event: KeyboardEvent) {
		if (!this.matches(':popover-open')) {
			return
		}

		if (event.key === 'Tab') {
			event.preventDefault()
			const reverse = event.shiftKey
			const list = [undefined, ...this.dataSources.map(ds => ds.id)]
			const currentIndex = !this.filteredDataSourceId ? 0 : list.indexOf(this.filteredDataSourceId)
			const nextIndex = ((currentIndex + (reverse ? -1 : 1)) + list.length) % list.length
			this.filteredDataSourceId = list[nextIndex % list.length]
		}
	}

	@eventListener('toggle')
	protected handleToggle(event: ToggleEvent) {
		if (event.newState === 'open') {
			this.searchField.focus()
			this.searchField.select()
			if (this.list) {
				this.list.focusController.focusIn()
				this.list.focusController.focusedItemIndex = 0
			}
		} else if (event.newState === 'closed') {
			if (this.list) {
				this.list.focusController.focusedItemIndex = undefined
				this.list.focusController.focusOut()
			}
		}
	}

	// Handling "close on outside click" manually because the host IS the backdrop as :host(::backdrop) does not work.
	@eventListener('click')
	protected handleClick(event: MouseEvent) {
		if (event.target === this) {
			this.hidePopover()
		}
	}

	private readonly fetcherController = new FetcherController(this, {
		throttle: 500,
		fetch: () => this.keyword ? this.getKeywordDataTemplate() : this.getInitialDataTemplate(),
	})

	private async getInitialDataTemplate() {
		const all = await Promise.allSettled(this.dataSources.map(ds => ds.fetchData().then(data => ({ source: ds, data }))))
		return all.filter(r => r.status === 'fulfilled').map(r => r.value)
	}

	private async getKeywordDataTemplate() {
		const all = await Promise.allSettled(this.dataSources.map(ds => ds.searchData(this.keyword).then(data => ({ source: ds, data }))))
		return all.filter(r => r.status === 'fulfilled').map(r => r.value)
	}

	protected override updated(props: PropertyValues<this>) {
		super.updated(props)
		this.list?.focusController.focusIn()
	}

	static override get styles() {
		return css`
			:host {
				border: none;
				padding: 0;
				/* :host(::backdrop) does not work, using the host as backdrop instead. */
				align-items: center;
				justify-content: center;
				backdrop-filter: brightness(0.5) blur(3px) saturate(0.5);
				background: transparent;
				width: 100%;
				height: 100%;
			}

			:host(:popover-open) {
				display: flex;
				mo-card {
					opacity: 1;
					transform: scale(1);
					@starting-style {
						opacity: 0;
						transform: scale(0.7);
					}
				}
			}

			mo-card {
				width: clamp(300px, 80vw, 600px);
				height: clamp(300px, 65vh, 800px);
				transition: 150ms ease-in-out opacity, 150ms ease-in-out transform;
				box-sizing: border-box;
				background: var(--mo-color-background);
				--mo-card-body-padding: 0;
			}

			mo-tab-bar {
				mo-tab {
					&:not([active]) {
						opacity: 0.5;
					}
					mo-icon {
						font-size: 18px;
					}
				}
			}

			mo-scroller {
				height: 100%;
				background: var(--mo-color-transparent-gray-1);
			}

			mo-list {
				display: flex;
				flex-direction: column;

				&[data-fetching] mo-list-item {
					opacity: 0.25;
					background: var(--mo-color-transparent-gray);
				}

				mo-list-item {
					padding: 10px;
					border-radius: 4px;
					font-size: 0.9em;
					width: 100%;

					&:first-child {
						margin-top: 6px;
					}

					mo-icon {
						color: var(--mo-color-gray);
						align-self: baseline;
					}

					.secondary {
						opacity: 0.5;
						font-size: 0.75em;
					}
				}
			}

			mo-empty-state {
				width: 100%;
				flex: 1;
			}

			.match {
				color: var(--mo-color-accent);
				font-weight: bold;
			}

			#buttons {
				z-index: 1;
				margin-top: auto;
				mo-button {
					flex: 1;
					border: 1px solid var(--mo-color-transparent-gray-3);
					border-inline-end: none;
					border-radius: 0px;
					--mo-button-accent-color: var(--mo-color-gray);
					--_container-height: 26px;
					span {
						font-size: small;
					}

					&:first-child {
						border-inline-start: none;
					}
				}
			}

			#guidance {
				display: flex;
				align-items: center;
				padding-inline: 10px;
				padding-block: 11.5px;
				color: var(--mo-color-gray);

				span {
					font-size: small;
					display: flex;
					align-items: center;
					gap: 6px;
				}
			}
		`
	}

	protected override get template() {
		const refocusSearch = () => {
			this.searchField.focus()
			this.list?.focusController.focusIn()
		}
		return html`
			<mo-card type='outlined' ?data-fetching=${this.fetcherController.isFetching} @click=${(e: PointerEvent) => e.stopPropagation()}>
				<mo-flex style='height: 100%'>
					<mo-command-palette-search-field ?fetching=${this.fetcherController.isFetching} ${bind(this, 'keyword')}></mo-command-palette-search-field>
					<mo-tab-bar ${bind(this, 'filteredDataSourceId', { sourceUpdated: () => refocusSearch() })}>
						<mo-tab>${t('All')}</mo-tab>
						${this.dataSources.map(ds => html`
							<mo-tab value=${ds.id} .inlineIcon=${true}>
								<mo-icon icon=${ds.icon}></mo-icon>
								${ds.name}
							</mo-tab>
						`)}
					</mo-tab-bar>
					<mo-scroller>
						<mo-flex style='height: 100%'>
							${this.listTemplate}
						</mo-flex>
					</mo-scroller>
					${this.newItemsTemplate}
					${this.guidanceTemplate}
				</mo-flex>
			</mo-card>
		`
	}

	private get listTemplate() {
		const selectedDataSource = this.dataSources.find(ds => ds.id === this.filteredDataSourceId)
		const data = (this.fetcherController.data ?? [])
			.filter(i => !this.filteredDataSourceId || i.source.id === this.filteredDataSourceId)
			.flatMap(i => i.data) ?? []
		return !data.length && !this.fetcherController.isFetching ? html`
			<mo-empty-state icon=${selectedDataSource?.icon ?? 'search'}>${t('No results')}</mo-empty-state>
		` : html`
			<mo-list ?data-fetching=${this.fetcherController.isFetching}>
				${data.map(item => html`
					<mo-list-item @click=${() => this.executeCommand(item.command)}>
						<mo-icon icon=${item.icon}></mo-icon>
						<mo-flex>
							<span class='label'>${this.getSearchedTemplate(item.label)}</span>
							${!item.secondaryLabel ? html.nothing : html`<span class='label secondary'>${this.getSearchedTemplate(item.secondaryLabel)}</span>`}
						</mo-flex>
					</mo-list-item>
				`)}
			</mo-list>
		`
	}

	private getSearchedTemplate(text: string) {
		const keyword = this.keyword?.trim().toLowerCase() ?? ''
		const match = text.toLowerCase().indexOf(keyword)
		// It is important that the span is not in the next line, otherwise a space is added
		return match === -1 ? html`${text}` : html`
			${text.slice(0, match)}<span class='match'>${text.slice(match, match + keyword.length)}</span>${text.slice(match + keyword.length)}
		`
	}

	private get newItemsTemplate() {
		const items = this.dataSources
			.filter(ds => ds.getNewItem)
			.map(ds => ds.getNewItem!(this.keyword)!)
		return html`
			<mo-flex id='buttons' direction='horizontal'>
				${items.map(item => html`
					<mo-button @click=${() => this.executeCommand(item.command)}>
						<mo-flex>
							<mo-icon icon=${item.icon}></mo-icon>
							<span>${item.label}</span>
						</mo-flex>
					</mo-button>
				`)}
			</mo-flex>
		`
	}

	private executeCommand(command: () => void) {
		command()
		this.hidePopover()
	}

	private get guidanceTemplate() {
		return html`
			<mo-flex id='guidance' direction='horizontal' gap='24px'>
				<span>
					<mo-keyboard-key key='Escape'></mo-keyboard-key>
					${t('Close')}
				</span>
				<span>
					<mo-keyboard-key key='ArrowUp + ArrowDown'></mo-keyboard-key>
					${t('Navigate list')}
				</span>
				<span>
					<mo-keyboard-key key='Tab'></mo-keyboard-key>
					${t('Navigate tabs')}
				</span>
			</mo-flex>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'eb-command-palette': CommandPalette
	}
}