// @ts-nocheck
import { Story } from '@storybook/web-components'

export function createStory<TProps extends Record<unknown, unknown>, TStory extends Story<TProps>>(props: TProps, story: TStory): TStory {
	(story = story.bind({})).args = props
	return story
}