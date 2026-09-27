import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { sourceOf } from '../../.storybook/source.js'
import teamDirectorySource from './TeamDirectory.ts?raw'
import personCardSource from './PersonCard.ts?raw'
import './TeamDirectory.js'

/**
 * A team directory: cards of people in a responsive grid, each with contact links, a menu and a profile dialog,
 * under a search and a country filter, with an empty state when nobody matches.
 */
export default {
	title: 'Recipes / Team Directory',
} satisfies Meta

export const Default: StoryObj = {
	parameters: sourceOf(`${teamDirectorySource}\n\n${personCardSource}`),
	render: () => html`<recipe-team-directory></recipe-team-directory>`,
}