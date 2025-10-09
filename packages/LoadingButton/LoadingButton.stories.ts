import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html, style } from '@a11d/lit'
import { ButtonType } from '@3mo/button'
import p from './package.json'
import '.'

export default {
	title: 'Buttons & Actions / Loading Button',
	component: 'mo-loading-button',
	args: {
		type: ButtonType.Outlined,
		disabled: false,
		loading: false,
		preventClickEventInference: false,
	},
	argTypes: {
		type: { control: 'select', options: [ButtonType.Text, ButtonType.Outlined, ButtonType.Elevated, ButtonType.Filled] },
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

export const WithStartIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} startIcon='add' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Start Icon</mo-loading-button>`
}

export const WithEndIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} endIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>End Icon</mo-loading-button>`
}

export const WithStartAndEndIcon: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} startIcon='add' endIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Start & End Icon</mo-loading-button>`
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

export const WithComplexContentAndEndContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001</div>
			</mo-flex>
			<span slot='end' ${style({ fontSize: '36px' })}>₿</span>
		</mo-loading-button>
	`
}

export const WithCustomizedAccentColor: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ '--mo-loading-button-accent-color': 'red' })}>
			<span slot='start' ${style({ fontSize: '36px' })}>⚠️</span>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>Danger</div>
				<div ${style({ fontSize: '25px' })}>Proceed with your own risk</div>
			</mo-flex>
		</mo-loading-button>
	`
}

export const WithEndInteractiveContent: StoryObj = {
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} @click=${handler}>
			Proceed
			<mo-icon-button slot='end' icon='help' dense ?disabled=${disabled} ${style({ fontSize: '20px' })} @click=${(e: PointerEvent) => { e.stopImmediatePropagation(); alert('Help') }}></mo-icon-button>
		</mo-loading-button>
	`
}