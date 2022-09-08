import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'Button',
	component: 'mo-button',
	args: {
		type: 'outlined',
		disabled: false,
	},
	argTypes: {
		type: { control: 'select', options: ['normal', 'outlined', 'raised', 'unelevated'] },
		disabled: { control: 'boolean' },
	},
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const Button = story({
	render: ({ type, disabled }) => html`<mo-button type=${type} ?disabled=${disabled}>Button</mo-button>`
})

export const WithLeadingIcon = story({
	render: ({ type, disabled }) => html`<mo-button leadingIcon='add' type=${type} ?disabled=${disabled}>Leading Icon</mo-button>`
})

export const WithTrailingIcon = story({
	render: ({ type, disabled }) => html`<mo-button trailingIcon='done' type=${type} ?disabled=${disabled}>Trailing Icon</mo-button>`
})

export const WithLeadingAndTrailingIcon = story({
	render: ({ type, disabled }) => html`<mo-button leadingIcon='add' trailingIcon='done' type=${type} ?disabled=${disabled}>Leading & Trailing Icon</mo-button>`
})

export const WithNonTextContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled}>
			<mo-icon icon='delete'></mo-icon>
		</mo-button>
	`
})

export const WithComplexContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001₿</div>
			</mo-flex>
		</mo-button>
	`
})

export const WithComplexContentAndTrailingContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001</div>
			</mo-flex>
			<span slot='trailing' ${style({ fontSize: '36px' })}>₿</span>
		</mo-button>
	`
})

export const WithCustomizedAccentColor = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} ${style({ '--mo-button-accent-color': 'red' })}>
			<span slot='leading' ${style({ fontSize: '36px' })}>⚠️</span>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>Danger</div>
				<div ${style({ fontSize: '25px' })}>Proceed with your own risk</div>
			</mo-flex>
		</mo-button>
	`
})

export const WithTrailingInteractiveContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} @click=${() => alert('Proceed')}>
			Proceed
			<mo-icon-button slot='trailing' icon='help' dense ?disabled=${disabled} ${style({ fontSize: '20px' })} @click=${(e: PointerEvent) => { e.stopImmediatePropagation(); alert('Help') }}></mo-icon-button>
		</mo-button>
	`
})