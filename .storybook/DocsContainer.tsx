import React, { useEffect, useState, type PropsWithChildren } from 'react'
import { DocsContainer as StorybookDocsContainer, type DocsContainerProps } from '@storybook/addon-docs/blocks'
import { Theme } from '@3mo/theme'
import { themes } from './theme.js'
import './docs.css'

export function DocsContainer({ children, ...props }: PropsWithChildren<DocsContainerProps>) {
	const [scheme, setScheme] = useState(() => Theme.background.calculatedValue)

	useEffect(() => {
		const update = () => setScheme(Theme.background.calculatedValue)
		const media = window.matchMedia('(prefers-color-scheme: dark)')
		Theme.background.changed.subscribe(update)
		media.addEventListener('change', update)
		return () => {
			Theme.background.changed.unsubscribe(update)
			media.removeEventListener('change', update)
		}
	}, [])

	return <StorybookDocsContainer {...props} theme={themes[scheme]}>{children}</StorybookDocsContainer>
}