import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { Component, css, html, state, style } from '@a11d/lit'
import p from './package.json'
import '@3mo/card'
import '@3mo/flex'
import '@3mo/icon'
import './index.js'

export default {
	title: 'Selection & Input / Selection Group',
	component: 'mo-selection-group',
	package: p,
} as Meta

/**
 * The group draws nothing and knows nothing about what an answer looks like, so an answer in these stories
 * is a plain `<button>` — styled off `data-selectability`, which is the hook the group stamps on every item
 * it owns. Anything else carrying a `value` behaves identically.
 */
class StoryOptions extends Component {
	static override get styles() {
		return css`
			button {
				display: inline-flex;
				align-items: center;
				gap: 0.5rem;
				min-height: 2.25rem;
				padding-inline: 1rem;
				border: none;
				border-radius: var(--mo-border-radius);
				box-shadow: inset 0 0 0 1px var(--mo-color-gray-transparent);
				background: transparent;
				color: var(--mo-color-on-surface);
				font: inherit;
				font-size: 0.875rem;
				cursor: pointer;
				transition: background-color 200ms, box-shadow 200ms;
			}

			button:hover {
				background: var(--mo-color-transparent-gray-3);
			}

			/* The outline stays, in the accent. A chosen answer that gave up its edge reads as dimmed
			   rather than picked, because the selected foreground is a tint by design. */
			button[data-selectability=selected] {
				box-shadow: inset 0 0 0 1px currentColor;
				background: var(--mo-color-selected);
				color: var(--mo-color-on-selected);
			}

			button:focus-visible {
				outline: 2px solid currentCurrent;
				outline-offset: 2px;
			}
		`
	}
}

/**
 * A question and its answers, where a question is usually asked — inside something else.
 * `selectability='single'` and nothing more makes it a radio group: exactly one answer is chosen, Tab enters
 * at that one, and the arrows move between them without leaving the group.
 *
 * The group's `value` is the only state there is. Nothing writes `selected` on an answer.
 */
export const SelectionGroup: StoryObj = {
	render: () => html`<mo-story-selection-group></mo-story-selection-group>`
}

class StorySelectionGroup extends StoryOptions {
	@state() private location?: string = 'berlin'

	protected override get template() {
		return html`
			<mo-card heading='Pickup location' subHeading='Where this order is collected' ${style({ maxWidth: '440px' })}>
				<mo-selection-group selectability='single' aria-label='Pickup location'
					value=${this.location ?? ''}
					@change=${(e: CustomEvent<string | undefined>) => this.location = e.detail}
				>
					${[['berlin', 'Berlin'], ['hamburg', 'Hamburg'], ['munich', 'Munich']].map(([value, label]) => html`
						<button value=${value!}>
							<mo-icon icon='place'></mo-icon>
							${label}
						</button>
					`)}
				</mo-selection-group>

				<mo-flex slot='footer' direction='horizontal' gap='0.5rem' alignItems='center'>
					<mo-icon icon='local_shipping'></mo-icon>
					Collect in <b>${this.location ?? 'nowhere yet'}</b>
				</mo-flex>
			</mo-card>
		`
	}
}

customElements.define('mo-story-selection-group', StorySelectionGroup)

/**
 * The pattern is derived from how the group can be selected, never configured twice — and each one
 * announces itself accordingly. A screen reader hears a radio group, then two sets of toggles, then a
 * toolbar, without any of that appearing in the markup.
 */
export const Patterns: StoryObj = {
	render: () => html`<mo-story-patterns></mo-story-patterns>`
}

class StoryPatterns extends StoryOptions {
	private options(label: string) {
		return html`
			<small>${label}</small>
			<button value='day'>Day</button>
			<button value='week'>Week</button>
			<button value='month'>Month</button>
		`
	}

	protected override get template() {
		return html`
			<mo-flex gap='1.5rem' alignItems='start'>
				<mo-selection-group selectability='single' value='week' aria-label='A radio group'>
					${this.options('single — a radio group; one is always chosen')}
				</mo-selection-group>

				<mo-selection-group selectability='single' deselectable value='week' aria-label='A deselectable set'>
					${this.options('single + deselectable — toggles; the answer can be taken back')}
				</mo-selection-group>

				<mo-selection-group selectability='multiple' .value=${['day', 'week']} aria-label='A multiple set'>
					${this.options('multiple — toggles; the value is an array')}
				</mo-selection-group>

				<mo-selection-group aria-label='A toolbar'>
					${this.options('none — a toolbar; one tab stop, no selection')}
				</mo-selection-group>
			</mo-flex>
		`
	}

	static override get styles() {
		return css`
			${super.styles}

			mo-selection-group {
				align-items: center;
			}

			small {
				flex-basis: 100%;
				color: var(--mo-color-gray);
			}
		`
	}
}

customElements.define('mo-story-patterns', StoryPatterns)

/**
 * The group owns no layout beyond a gap, so the option-tile grid a point of sale wants is one line of CSS at
 * the call site. Same group, same items — only the children and the columns changed.
 */
export const Tiles: StoryObj = {
	render: () => html`<mo-story-tiles></mo-story-tiles>`
}

class StoryTiles extends StoryOptions {
	protected override get template() {
		return html`
			<mo-card heading='Payment method'>
				<mo-selection-group selectability='single' value='cash' aria-label='Payment method'>
					${[['cash', 'payments'], ['card', 'credit_card'], ['voucher', 'redeem'], ['invoice', 'receipt_long']].map(([value, icon]) => html`
						<button value=${value!}>
							<mo-icon icon=${icon!}></mo-icon>
							<span>${value}</span>
						</button>
					`)}
				</mo-selection-group>
			</mo-card>
		`
	}

	static override get styles() {
		return css`
			${super.styles}

			mo-selection-group {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
				max-width: 480px;
			}

			button {
				flex-direction: column;
				justify-content: center;
				gap: 0.375rem;
				min-height: 5rem;
				font-size: 1.5rem;
			}

			span {
				font-size: 0.875rem;
				text-transform: capitalize;
			}
		`
	}
}

customElements.define('mo-story-tiles', StoryTiles)