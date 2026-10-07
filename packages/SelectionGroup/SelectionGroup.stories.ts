import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import './index.js'

type Args = {
	readonly selectability: 'single' | 'multiple'
	readonly deselectable: boolean
}

export default {
	title: 'Inputs / Selection Group',
	component: 'mo-selection-group',
	args: {
		selectability: 'single',
		deselectable: false,
	},
	argTypes: {
		selectability: { control: 'select', options: ['single', 'multiple'] },
	},
} satisfies Meta<Args>

type Story = StoryObj<Args>

export const Default: Story = {
	render: ({ selectability, deselectable }) => html`
		<mo-selection-group aria-label='Pickup location' selectability=${selectability} ?deselectable=${deselectable} value='berlin'>
			<mo-selectable-button type='outlined' value='berlin' startIcon='place'>Berlin</mo-selectable-button>
			<mo-selectable-button type='outlined' value='hamburg' startIcon='place'>Hamburg</mo-selectable-button>
			<mo-selectable-button type='outlined' value='munich' startIcon='place'>Munich</mo-selectable-button>
		</mo-selection-group>
	`,
}

/** The group's `value` is its only state: nothing writes `selected` on an item. Bind it like the value of any field. */
export const Value: Story = {
	render: () => {
		const [location, setLocation] = useState<string | undefined>('berlin')
		return html`
			<mo-card heading='Pickup location' subHeading='Where this order is collected' style='max-width: 440px'>
				<mo-selection-group aria-label='Pickup location' selectability='single' .value=${location} @change=${(e: CustomEvent<string | undefined>) => setLocation(e.detail)}>
					<mo-selectable-button type='outlined' value='berlin' startIcon='place'>Berlin</mo-selectable-button>
					<mo-selectable-button type='outlined' value='hamburg' startIcon='place'>Hamburg</mo-selectable-button>
					<mo-selectable-button type='outlined' value='munich' startIcon='place'>Munich</mo-selectable-button>
				</mo-selection-group>
				<mo-flex slot='footer' direction='horizontal' gap='0.5rem' alignItems='center'>
					<mo-icon icon='local_shipping'></mo-icon>
					Collect in <b>${location ?? 'nowhere yet'}</b>
				</mo-flex>
			</mo-card>
		`
	},
}

/**
 * The ARIA pattern follows from the selectability. Top to bottom: `single` is a radio group, `deselectable` and `multiple` make toggle buttons,
 * and without a selectability the group is a toolbar of commands. Tab enters at the selected item and the arrow keys move between the items.
 */
export const Patterns: Story = {
	render: () => html`
		<mo-flex gap='1.5rem' alignItems='start'>
			<mo-selection-group aria-label='Single' selectability='single' value='week'>
				<mo-selectable-button type='outlined' value='day'>Day</mo-selectable-button>
				<mo-selectable-button type='outlined' value='week'>Week</mo-selectable-button>
				<mo-selectable-button type='outlined' value='month'>Month</mo-selectable-button>
			</mo-selection-group>
			<mo-selection-group aria-label='Single and deselectable' selectability='single' deselectable value='week'>
				<mo-selectable-button type='outlined' value='day'>Day</mo-selectable-button>
				<mo-selectable-button type='outlined' value='week'>Week</mo-selectable-button>
				<mo-selectable-button type='outlined' value='month'>Month</mo-selectable-button>
			</mo-selection-group>
			<mo-selection-group aria-label='Multiple' selectability='multiple' .value=${['day', 'week']}>
				<mo-selectable-button type='outlined' value='day'>Day</mo-selectable-button>
				<mo-selectable-button type='outlined' value='week'>Week</mo-selectable-button>
				<mo-selectable-button type='outlined' value='month'>Month</mo-selectable-button>
			</mo-selection-group>
			<mo-selection-group aria-label='Toolbar'>
				<mo-button type='outlined' value='day'>Day</mo-button>
				<mo-button type='outlined' value='week'>Week</mo-button>
				<mo-button type='outlined' value='month'>Month</mo-button>
			</mo-selection-group>
		</mo-flex>
	`,
}

/** The group owns no layout beyond a wrapping row, so a grid of tiles is one `style` away. */
export const Tiles: Story = {
	render: () => html`
		<mo-selection-group aria-label='Payment method' selectability='single' value='cash'
			style='display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); max-width: 480px'
		>
			<mo-selectable-button type='outlined' value='cash' style='min-height: 5rem'>
				<mo-flex alignItems='center' gap='0.375rem'>
					<mo-icon icon='payments' style='font-size: 1.5rem'></mo-icon>
					Cash
				</mo-flex>
			</mo-selectable-button>
			<mo-selectable-button type='outlined' value='card' style='min-height: 5rem'>
				<mo-flex alignItems='center' gap='0.375rem'>
					<mo-icon icon='credit_card' style='font-size: 1.5rem'></mo-icon>
					Card
				</mo-flex>
			</mo-selectable-button>
			<mo-selectable-button type='outlined' value='voucher' style='min-height: 5rem'>
				<mo-flex alignItems='center' gap='0.375rem'>
					<mo-icon icon='redeem' style='font-size: 1.5rem'></mo-icon>
					Voucher
				</mo-flex>
			</mo-selectable-button>
			<mo-selectable-button type='outlined' value='invoice' style='min-height: 5rem'>
				<mo-flex alignItems='center' gap='0.375rem'>
					<mo-icon icon='receipt_long' style='font-size: 1.5rem'></mo-icon>
					Invoice
				</mo-flex>
			</mo-selectable-button>
		</mo-selection-group>
	`,
}

/** Any element child with a `value` is an item, even a plain `<button>`: the group stamps `data-selectability` on it to style by. */
export const PlainElements: Story = {
	render: () => html`
		<style>
			.plain button {
				min-height: 2.25rem;
				padding-inline: 1rem;
				border: 1px solid var(--mo-color-gray-transparent);
				border-radius: var(--mo-border-radius);
				background: transparent;
				color: inherit;
				font: inherit;
				cursor: pointer;
			}

			.plain button[data-selectability=selected] {
				border-color: currentColor;
				background: var(--mo-color-selected);
				color: var(--mo-color-on-selected);
			}
		</style>
		<mo-selection-group class='plain' aria-label='Size' selectability='single' value='m'>
			<button value='s'>Small</button>
			<button value='m'>Medium</button>
			<button value='l'>Large</button>
		</mo-selection-group>
	`,
}
