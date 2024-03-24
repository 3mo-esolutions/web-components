import type { Meta, StoryObj } from '@storybook/web-components'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default {
	title: 'Loading Button',
	component: 'mo-loading-button',
	args: {
		type: 'outlined',
		disabled: false,
		loading: false,
		preventClickEventInference: false,
	},
	argTypes: {
		type: { control: 'select', options: ['normal', 'outlined', 'raised', 'unelevated'] },
		disabled: { control: 'boolean' },
	},
	package: p,
} as Meta

const handler = async () => {
	await new Promise(resolve => setTimeout(resolve, 2000))
	alert('Done processing!')
}

export const LoadingButton: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Button</mo-loading-button>`
}

export const WithCustomBorderRadius: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ borderRadius: '100px' })}>Custom Border Radius</mo-loading-button>`
}

export const WithLeadingIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} leadingIcon='add' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Leading Icon</mo-loading-button>`
}

export const WithTrailingIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} trailingIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Trailing Icon</mo-loading-button>`
}

export const WithLeadingAndTrailingIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} leadingIcon='add' trailingIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Leading & Trailing Icon</mo-loading-button>`
}

export const WithNonTextContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>
			<mo-icon icon='delete'></mo-icon>
		</mo-loading-button>
	`
}

export const WithComplexContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001₿</div>
			</mo-flex>
		</mo-loading-button>
	`
}

export const WithComplexContentAndTrailingContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001</div>
			</mo-flex>
			<span slot='trailing' ${style({ fontSize: '36px' })}>₿</span>
		</mo-loading-button>
	`
}

export const WithCustomizedAccentColor: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ '--mo-loading-button-accent-color': 'red' })}>
			<span slot='leading' ${style({ fontSize: '36px' })}>⚠️</span>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>Danger</div>
				<div ${style({ fontSize: '25px' })}>Proceed with your own risk</div>
			</mo-flex>
		</mo-loading-button>
	`
}

export const WithTrailingInteractiveContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} @click=${handler}>
			Proceed
			<mo-icon-button slot='trailing' icon='help' dense ?disabled=${disabled} ${style({ fontSize: '20px' })} @click=${(e: PointerEvent) => { e.stopImmediatePropagation(); alert('Help') }}></mo-icon-button>
		</mo-loading-button>
	`
}