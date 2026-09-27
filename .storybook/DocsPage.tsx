import React from 'react'
import { Stories } from '@storybook/addon-docs/blocks'
import { Accessibility, Api, Changelog, Hero, Install, Playground } from './blocks.js'

/** Every component page, unless its stories file has an MDX page attached, which composes the same blocks. */
export function DocsPage() {
	return (
		<>
			<Hero />
			<Install />
			<Playground />
			<Stories title='Examples' includePrimary={false} />
			<Accessibility />
			<Api />
			<Changelog />
		</>
	)
}