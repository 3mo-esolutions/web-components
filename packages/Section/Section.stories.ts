import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'

export default {
	title: 'Layout & Containment / Section',
	component: 'mo-section',
	args: {
		heading: 'Satoshi Nakamoto',
		content: `A purely peer-to-peer version of electronic cash would allow online
			payments to be sent directly from one party to another without going through a
			financial institution. Digital signatures provide part of the solution, but the main
			benefits are lost if a trusted third party is still required to prevent double-spending.
			We propose a solution to the double-spending problem using a peer-to-peer network.
			The network timestamps transactions by hashing them into an ongoing chain of
			hash-based proof-of-work, forming a record that cannot be changed without redoing
			the proof-of-work. The longest chain not only serves as proof of the sequence of
			events witnessed, but proof that it came from the largest pool of CPU power. As
			long as a majority of CPU power is controlled by nodes that are not cooperating to
			attack the network, they'll generate the longest chain and outpace attackers. The
			network itself requires minimal structure. Messages are broadcast on a best effort
			basis, and nodes can leave and rejoin the network at will, accepting the longest
			proof-of-work chain as proof of what happened while they were gone.`,
	},
	argTypes: {
		heading: { control: 'text' },
		content: { control: 'text' },
	},
	package: p,
} as Meta

export const Section: StoryObj = {
	render: ({ heading, content }) => html`
		<mo-section heading=${heading}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			${content}
		</mo-section>
	`
}

export const WithCustomHeading: StoryObj = {
	render: ({ heading, content }) => html`
		<style>
			mo-section::part(header) {
				border-block-end: 1px solid var(--mo-color-gray-transparent);
			}
		</style>
		<mo-section heading=${heading}>
			<mo-icon-button slot='action' icon='share'></mo-icon-button>
			<mo-icon-button slot='action' icon='more_vert'></mo-icon-button>
			${content}
		</mo-section>
	`
}