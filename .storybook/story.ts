import { Args, Meta, StoryObj } from '@storybook/web-components'

export type LitStory<TArgs extends Args> = StoryObj<TArgs> & {
	args?: TArgs
}

export function meta(metaDefinition: Meta) {
	return metaDefinition
}

export function story<TArgs extends Args>(storyDefinition: LitStory<TArgs>) {
	return storyDefinition
}