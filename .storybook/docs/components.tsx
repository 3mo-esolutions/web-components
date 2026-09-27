import React, { useContext, useEffect, useState, type MouseEvent, type PropsWithChildren } from 'react'
import { DocsContext, Markdown } from '@storybook/addon-docs/blocks'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { MarkdownLink } from '../blocks.js'
import './pages.css'

/** The title and lead of a documentation page, in the look of the component pages. */
export function PageHeader({ title, section = 'Getting Started', children }: PropsWithChildren<{ title: string, section?: string }>) {
	return (
		<header className='docs-hero'>
			<div className='docs-eyebrow'>{section}</div>
			<h1 className='docs-title'>{title}</h1>
			<div className='docs-lead'>{children}</div>
			<div className='docs-meta'>
				<span className='docs-meta-spacer' />
				<MarkdownLink />
			</div>
		</header>
	)
}

export function Cards({ children }: PropsWithChildren) {
	return <div className='docs-cards sb-unstyled'>{children}</div>
}

/** A card linking to a page of this Storybook, e.g. `?path=/docs/actions-button--overview`. */
export function Card({ title, href, children }: PropsWithChildren<{ title: string, href: string }>) {
	const { channel } = useContext(DocsContext)
	const navigate = (event: MouseEvent) => {
		if (event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
			event.preventDefault()
			channel.emit(NAVIGATE_URL, href)
		}
	}
	return (
		<a className='docs-card' href={href} onClick={navigate}>
			<span className='docs-card-title'>{title}</span>
			<span className='docs-card-text'>{children}</span>
		</a>
	)
}

const [loadChangelog] = Object.values(import.meta.glob<string>('../../CHANGELOG.md', { query: '?raw', import: 'default' }))

/** The changelog of all packages, which `npm run docs:build` generates. */
export function CombinedChangelog() {
	const [content, setContent] = useState<string>()
	useEffect(() => void loadChangelog?.().then(setContent), [])
	if (!loadChangelog) {
		return <p>The changelog appears once <code>npm run docs:build</code> has generated it.</p>
	}
	return !content ? null : (
		<div className='docs-changelog-page'>
			<Markdown>{groupByYear(content)}</Markdown>
		</div>
	)
}

/** Nests the generated `# yyyy-mm-dd` days under one `##` heading per year, which is all the table of contents lists. */
function groupByYear(changelog: string) {
	let year: string | undefined
	return changelog
		.replace(/^### /gm, '##### ')
		.replace(/^# ((\d{4})-\d{2}-\d{2})/gm, (_, date: string, dateYear: string) => {
			const heading = `#### ${date}`
			if (dateYear === year) {
				return heading
			}
			year = dateYear
			return `## ${dateYear}\n\n${heading}`
		})
}