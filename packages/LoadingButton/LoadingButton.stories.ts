import { story, meta } from '../../.storybook/story.js'
import { html, style } from '@a11d/lit'
import p from './package.json'
import '.'

export default meta({
	title: 'LoadingButton',
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
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

const handler = () => new Promise(resolve => setTimeout(resolve, 2000))

export const LoadingButton = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Button</mo-loading-button>`
})

export const WithLeadingIcon = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} leadingIcon='add' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Leading Icon</mo-loading-button>`
})

export const WithTrailingIcon = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} trailingIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Trailing Icon</mo-loading-button>`
})

export const WithLeadingAndTrailingIcon = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`<mo-loading-button @click=${handler} leadingIcon='add' trailingIcon='done' type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>Leading & Trailing Icon</mo-loading-button>`
})

export const WithNonTextContent = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference}>
			<mo-icon icon='delete'></mo-icon>
		</mo-loading-button>
	`
})

export const WithComplexContent = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001₿</div>
			</mo-flex>
		</mo-loading-button>
	`
})

export const WithComplexContentAndTrailingContent = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ minHeight: '50px', minWidth: '250px' })}>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>To Pay</div>
				<div ${style({ fontSize: '25px' })}>0.0001</div>
			</mo-flex>
			<span slot='trailing' ${style({ fontSize: '36px' })}>₿</span>
		</mo-loading-button>
	`
})

export const WithCustomizedAccentColor = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button @click=${handler} type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} ${style({ '--mo-loading-button-accent-color': 'red' })}>
			<span slot='leading' ${style({ fontSize: '36px' })}>⚠️</span>
			<mo-flex>
				<div ${style({ fontSize: '12px' })}>Danger</div>
				<div ${style({ fontSize: '25px' })}>Proceed with your own risk</div>
			</mo-flex>
		</mo-loading-button>
	`
})

export const WithTrailingInteractiveContent = story({
	render: ({ type, disabled, loading, preventClickEventInference }) => html`
		<mo-loading-button type=${type} ?disabled=${disabled} ?loading=${loading} ?preventClickEventInference=${preventClickEventInference} @click=${handler}>
			Proceed
			<mo-icon-button slot='trailing' icon='help' dense ?disabled=${disabled} ${style({ fontSize: '20px' })} @click=${(e: PointerEvent) => { e.stopImmediatePropagation(); alert('Help') }}></mo-icon-button>
		</mo-loading-button>
	`
})