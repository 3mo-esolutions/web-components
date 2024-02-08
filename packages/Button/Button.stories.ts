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

export const WithoutRipple = story({
	render: ({ type, disabled }) => html`
		<style>
			mo-button::part(ripple) { display: none; }
		</style>
		<mo-button type=${type} ?disabled=${disabled}>Button</mo-button>
	`
})

export const WithoutFocusRing = story({
	render: ({ type, disabled }) => html`
		<style>
			mo-button::part(focus-ring) { display: none; }
		</style>
		<mo-button type=${type} ?disabled=${disabled}>Button</mo-button>
	`
})

export const WithCustomBorderRadius = story({
	render: ({ type, disabled }) => html`<mo-button type=${type} ?disabled=${disabled} ${style({ borderRadius: '100px' })}>Custom Border Radius</mo-button>`
})

export const WithCustomDisabledColors = story({
	render: ({ type, disabled }) => html`<mo-button type=${type} ?disabled=${disabled} ${style({ '--mo-button-disabled-background-color': 'pink', '--mo-button-disabled-color': 'red' })}>Custom Disabled Colors</mo-button>`
})

export const WithCustomHorizontalPadding = story({
	render: ({ type, disabled }) => html`<mo-button type=${type} ?disabled=${disabled} ${style({ '--mo-button-horizontal-padding': '80px' })}>Custom horizontal Padding</mo-button>`
})

export const WithLeadingIcon = story({
	render: ({ type, disabled }) => html`<mo-button leadingIcon='contact_mail' type=${type} ?disabled=${disabled}>Leading Icon</mo-button>`
})

export const WithTrailingIcon = story({
	render: ({ type, disabled }) => html`<mo-button trailingIcon='done' type=${type} ?disabled=${disabled}>Trailing Icon</mo-button>`
})

export const WithLeadingAndTrailingIcon = story({
	render: ({ type, disabled }) => html`<mo-button leadingIcon='add' trailingIcon='done' type=${type} ?disabled=${disabled}>Leading & Trailing Icon</mo-button>`
})

export const WithLeadingAndTrailingIconRtl = story({
	render: ({ type, disabled }) => html`<mo-button dir='rtl' leadingIcon='add' trailingIcon='done' type=${type} ?disabled=${disabled}>با آیکان سر و ته</mo-button>`
})

export const WithNonTextContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled}>
			<mo-icon icon='delete'></mo-icon>
		</mo-button>
	`
})

export const WithOverflowingContent = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} style='max-width: 200px'>
			Something very very long that will overflow
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

export const WithCustomAccentColors = story({
	render: ({ type, disabled }) => html`
		<mo-button type=${type} ?disabled=${disabled} ${style({ '--mo-button-accent-color': 'var(--mo-color-red)', '--mo-button-on-accent-color': 'rgb(255, 189, 46)' })}>
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