import { Component, component, css, html, state } from '@a11d/lit'
import '@3mo/master-detail'

const source = `export async function convert(amount: number, to: Currency) {
	const rates = await fetchRates()
	const rate = rates[to.code]
	return amount * rate
}`

type OutputLine = { readonly text: string, readonly kind?: 'ok' | 'error' }

/** An editor whose output appears below it once it runs, made of plain elements only. */
@component('story-editor-and-output')
export class EditorAndOutput extends Component {
	@state() private output?: ReadonlyArray<OutputLine>
	@state() private collapsed = false

	static override get styles() {
		return css`
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
	}

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
			<mo-master-detail masterSize='65%' minSize='120px' ?collapsed=${this.collapsed}>
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
