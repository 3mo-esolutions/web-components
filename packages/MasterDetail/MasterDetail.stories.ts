import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { bind, Component, component, css, html, property, state, style } from '@a11d/lit'
import '@3mo/card'
import '@3mo/collapsible-card'
import '@3mo/data-grid'
import p from './package.json'
import { type MasterDetail } from './MasterDetail.js'
import './index.js'

export default {
	title: 'Layout & Containment / Master Detail',
	component: 'mo-master-detail',
	args: {
		direction: 'vertical',
		masterSize: '50%',
		minSize: '300px',
	},
	argTypes: {
		direction: { control: 'select', options: ['vertical', 'vertical-reversed', 'horizontal', 'horizontal-reversed'] },
		masterSize: { control: 'text' },
		minSize: { control: 'text' },
	},
	package: p,
} as Meta

type Invoice = { readonly id: number, readonly customer: string, readonly total: number, readonly positions: ReadonlyArray<string> }

const customers = [
	['Blake Logistics', 429.9, ['2 × Cable drum', '1 × Junction box']],
	['Diyoza Metalwork', 1204.5, ['12 × Steel plate', '4 × Weld seam sealant', '1 × Delivery surcharge']],
	['Griffin Apothecary', 88.4, ['6 × Glass vial']],
	['Alderson Systems', 3390, ['1 × Rack cabinet', '8 × Patch panel', '24 × Patch cable', '2 × Cooling unit']],
	['Stark Foundry', 762.75, ['3 × Crucible liner', '1 × Tong set']],
	['Caufield Photography', 219, ['1 × Film scanner service']],
] as ReadonlyArray<readonly [string, number, ReadonlyArray<string>]>

// Long enough to scroll: picking a row near the bottom is what proves the master pane keeps it in
// view after the detail pane has taken half the height away.
const invoices: ReadonlyArray<Invoice> = new Array(80).fill(undefined).map((_, index) => {
	const [customer, total, positions] = customers[index % customers.length]!
	return { id: 24001 + index, customer, total: total * (1 + (index % 7) / 10), positions }
})

/**
 * The master pane owns the state; the detail pane is nothing but its consequence. Whether the
 * detail is rendered at all stays the consumer's decision — the layout only reacts to the slot
 * being filled or emptied, which is why there is no placeholder to configure here.
 */
@component('story-master-detail')
class StoryMasterDetail extends Component {
	@property() direction: MasterDetail['direction'] = 'vertical'
	@property() masterSize = '50%'
	@property() minSize = '300px'
	@property({ type: Boolean }) collapsible = false

	@state() private selection = new Array<Invoice>()
	@state() private collapsed = false

	static override get styles() {
		return css`
			:host {
				display: block;
				height: 700px;
			}

			mo-card {
				--mo-card-body-padding: 0px;
			}
		`
	}

	protected override get template() {
		return html`
			<mo-master-detail
				direction=${this.direction}
				masterSize=${this.masterSize}
				minSize=${this.minSize}
				?collapsed=${this.collapsed}
			>
				<mo-card slot='master' heading='Invoices'>
					<mo-data-grid selectability='single' selectOnClick
						.data=${[...invoices]}
						.selectedData=${bind(this, 'selection')}
					>
						<mo-data-grid-column-number heading='Number' dataSelector='id' width='7rem'></mo-data-grid-column-number>
						<mo-data-grid-column-text heading='Customer' dataSelector='customer'></mo-data-grid-column-text>
						<mo-data-grid-column-currency heading='Total' dataSelector='total' currency='EUR' width='9rem'></mo-data-grid-column-currency>
					</mo-data-grid>
				</mo-card>

				${!this.selection.length ? html.nothing : this.detailTemplate(this.selection[0]!)}
			</mo-master-detail>
		`
	}

	private detailTemplate(invoice: Invoice) {
		const positions = html`
			<mo-flex gap='0.5rem' ${style({ padding: '1rem' })}>
				${invoice.positions.map(position => html`<div>${position}</div>`)}
			</mo-flex>
		`
		return this.collapsible
			? html`
				<mo-collapsible-card slot='detail' heading=${`Positions of #${invoice.id}`}
					?collapsed=${this.collapsed}
					@collapse=${(e: CustomEvent<boolean>) => this.collapsed = e.detail}
				>${positions}</mo-collapsible-card>
			`
			: html`
				<mo-card slot='detail' heading=${`Positions of #${invoice.id}`}>${positions}</mo-card>
			`
	}
}

StoryMasterDetail

/**
 * Select a row and the detail pane takes its share of the space; deselect and the master pane gets
 * all of it back. Nothing is reserved for a pane that has nothing to show.
 */
export const MasterDetail: StoryObj = {
	render: ({ direction, masterSize, minSize }) => html`
		<story-master-detail direction=${direction} masterSize=${masterSize} minSize=${minSize}></story-master-detail>
	`
}

/**
 * The same layout side by side, which is the shape most desktop clients reach for once the master
 * pane is narrow enough to live in a column. Only `direction` changes — `masterSize` and `minSize`
 * are measured along whichever axis the panes are laid out on.
 */
export const SideBySide: StoryObj = {
	args: { direction: 'horizontal' },
	render: ({ direction, masterSize, minSize }) => html`
		<story-master-detail direction=${direction} masterSize=${masterSize} minSize=${minSize}></story-master-detail>
	`
}

/**
 * A collapsible detail pane keeps its heading reachable instead of disappearing: `collapsed` shrinks
 * the pane to the size of its own content and hands the remaining space — and the resizer — to the
 * master pane. Bind it to whatever collapses inside the pane.
 */
export const CollapsibleDetail: StoryObj = {
	render: ({ direction, masterSize, minSize }) => html`
		<story-master-detail collapsible direction=${direction} masterSize=${masterSize} minSize=${minSize}></story-master-detail>
	`
}

const source = `export async function convert(amount: number, to: Currency) {
	const rates = await fetchRates()
	const rate = rates[to.code]
	return amount * rate
}
`

type OutputLine = { readonly text: string, readonly kind?: 'ok' | 'error' }

const consoleStyles = css`
	:host {
		display: block;
		height: 700px;
	}

	.pane {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		overflow: hidden;
		border: 1px solid var(--mo-color-transparent-gray-3);
		border-radius: var(--mo-border-radius);
		background: var(--mo-color-surface-container-low);
		font-family: ui-monospace, monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
	}

	header {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--mo-color-transparent-gray-3);
		color: var(--mo-color-gray);

		.spacer { flex: 1 }
	}

	button {
		font: inherit;
		color: inherit;
		background: none;
		border: none;
		border-radius: var(--mo-border-radius);
		padding: 0.15rem 0.6rem;
		cursor: pointer;

		&:hover { background: var(--mo-color-transparent-gray-3) }

		&.run {
			color: var(--mo-color-on-accent);
			background: var(--mo-color-accent);
		}
	}

	textarea {
		flex: 1;
		resize: none;
		border: none;
		outline: none;
		padding: 0.75rem;
		font: inherit;
		tab-size: 2;
		color: var(--mo-color-foreground);
		background: none;
	}

	.output {
		flex: 1;
		overflow: auto;
		padding: 0.75rem;
		white-space: pre-wrap;

		.ok { color: var(--mo-color-green) }
		.error { color: var(--mo-color-red) }
	}
`

/**
 * Nothing here is a 3MO component: two plain `div`s, a `textarea` and a few `button`s. The layout
 * asks for no more than that — it sizes whatever it is handed and reacts to the slot filling up.
 */
@component('story-master-detail-console')
class StoryMasterDetailConsole extends Component {
	@property() direction: MasterDetail['direction'] = 'vertical'
	@property() masterSize = '65%'
	@property() minSize = '120px'

	@state() private output?: ReadonlyArray<OutputLine>
	@state() private collapsed = false

	static override get styles() { return consoleStyles }

	private run() {
		this.collapsed = false
		this.output = [
			{ text: '$ tsc --noEmit && node dist/main.js' },
			{ text: 'Compiled 3 files in 412 ms', kind: 'ok' },
			{ text: 'Fetching rates …' },
			{ text: 'main.ts:3 — no rate for "CHF"', kind: 'error' },
			{ text: 'Process exited with code 1', kind: 'error' },
		]
	}

	protected override get template() {
		return html`
			<mo-master-detail
				direction=${this.direction}
				masterSize=${this.masterSize}
				minSize=${this.minSize}
				?collapsed=${this.collapsed}
			>
				<div slot='master' class='pane'>
					<header>
						<span>main.ts</span>
						<span class='spacer'></span>
						<button class='run' @click=${() => this.run()}>▶ Run</button>
					</header>
					<textarea spellcheck='false' .value=${source}></textarea>
				</div>

				${!this.output ? html.nothing : html`
					<div slot='detail' class='pane'>
						<header>
							<span>Output</span>
							<span class='spacer'></span>
							<button @click=${() => this.collapsed = !this.collapsed}>${this.collapsed ? 'Expand' : 'Collapse'}</button>
							<button @click=${() => this.output = undefined}>Close</button>
						</header>
						${this.collapsed ? html.nothing : html`
							<div class='output'>
								${this.output.map(line => html`<div class=${line.kind ?? ''}>${line.text}</div>`)}
							</div>
						`}
					</div>
				`}
			</mo-master-detail>
		`
	}
}

StoryMasterDetailConsole

/**
 * The detail pane does not have to follow a selection — here it follows an *action*. Nothing is
 * reserved for the output while there is none, "Run" makes the pane appear, "Collapse" leaves only
 * its header, and "Close" empties the slot from inside the pane so the editor takes the height back.
 * The layout never learns what either pane contains.
 */
export const EditorAndOutput: StoryObj = {
	args: { masterSize: '65%', minSize: '120px' },
	render: ({ direction, masterSize, minSize }) => html`
		<story-master-detail-console direction=${direction} masterSize=${masterSize} minSize=${minSize}></story-master-detail-console>
	`
}