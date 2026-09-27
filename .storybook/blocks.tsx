import React, { useContext, useEffect, useState } from 'react'
import { ArgTypes, Controls, DocsContext, Heading, Markdown, Primary, useOf } from '@storybook/addon-docs/blocks'
import { getCustomElements } from '@storybook/web-components-vite'

type PackageJson = { readonly name: string, readonly version: string, readonly description?: string }

const packageJsons = import.meta.glob<PackageJson>(['../packages/*/package.json', '../samples/*/package.json'], { eager: true, import: 'default' })
const changelogs = import.meta.glob<string>('../packages/*/CHANGELOG.md', { query: '?raw', import: 'default' })

const repository = 'https://github.com/3mo-esolutions/web-components'

/** The directory of the nearest package.json above a story file, e.g. `packages/Button`. */
function packageDirectoryOf(fileName: string) {
	const segments = fileName.replace(/^\.\//, '').split('/').slice(0, -1)
	while (segments.length) {
		const directory = segments.join('/')
		if (packageJsons[`../${directory}/package.json`]) {
			return directory
		}
		segments.pop()
	}
	return undefined
}

/** What a component page is made of, read from the stories file it documents. */
function usePage() {
	const { preparedMeta } = useOf('meta') as any
	const title = String(preparedMeta.title)
	const tag = typeof preparedMeta.component === 'string' ? preparedMeta.component : undefined
	const directory = packageDirectoryOf(String(preparedMeta.parameters.fileName ?? ''))
	const packageJson = !directory ? undefined : packageJsons[`../${directory}/package.json`]
	const [lead, ...details] = String((!tag ? undefined : getCustomElements()?.tags?.find((t: any) => t.name === tag)?.description) || packageJson?.description || '')
		.split(/\n\s*\n/)
		.map(paragraph => paragraph.trim())
		.filter(Boolean)
	return {
		name: title.split('/').pop()!.trim(),
		section: title.split('/').slice(0, -1).map(segment => segment.trim()),
		tag,
		controller: typeof preparedMeta.parameters.controller === 'string' ? preparedMeta.parameters.controller as string : undefined,
		directory,
		packageJson: directory?.startsWith('samples/') ? undefined : packageJson,
		status: (preparedMeta.tags as Array<string>).find(t => t.startsWith('status:'))?.slice('status:'.length),
		lead,
		details,
	}
}

/** Title, description, tag, version and links of the documented component. */
export function Hero() {
	const { name, section, tag, directory, packageJson, status, lead, details } = usePage()
	return (
		<>
			<header className='docs-hero'>
				{!section.length ? null : <div className='docs-eyebrow'>{section.join(' · ')}</div>}
				<h1 className='docs-title'>{name}</h1>
				{!lead ? null : <div className='docs-lead'><Markdown options={{ forceInline: true }}>{lead}</Markdown></div>}
				<div className='docs-meta'>
					{!tag ? null : <span className='docs-chip docs-chip-mono'>{`<${tag}>`}</span>}
					{!packageJson ? null : <span className='docs-chip'>v{packageJson.version}</span>}
					{!status ? null : <span className={`docs-chip docs-chip-${status}`}>{status}</span>}
					<span className='docs-meta-spacer' />
					{!packageJson ? null : <a className='docs-link' href={`https://www.npmjs.com/package/${packageJson.name}`} target='_blank' rel='noreferrer'>npm</a>}
					{!directory ? null : <a className='docs-link' href={`${repository}/tree/main/${directory}`} target='_blank' rel='noreferrer'>Source</a>}
					<MarkdownLink />
				</div>
			</header>
			{!details.length ? null : <div className='docs-details'><Markdown>{details.join('\n\n')}</Markdown></div>}
		</>
	)
}

/** The page as Markdown, which the documentation build publishes for language models. */
export function MarkdownLink() {
	const id = new URLSearchParams(location.search).get('id')?.split('--')[0]
	return !id ? null : <a className='docs-link' href={`docs/${id}.md`} target='_blank' rel='noreferrer'>Markdown</a>
}

function Copyable({ label, code }: { label: string, code: string }) {
	const [copied, setCopied] = useState(false)
	const copy = async () => {
		await navigator.clipboard.writeText(code)
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}
	return (
		<div className='docs-install-row'>
			<span className='docs-install-label'>{label}</span>
			<code>{code}</code>
			<button type='button' onClick={copy} aria-label={`Copy "${code}"`}>{copied ? 'Copied' : 'Copy'}</button>
		</div>
	)
}

/** The install command and, for packages that register elements, the import. */
export function Install() {
	const { tag, packageJson } = usePage()
	return !packageJson ? null : (
		<div className='docs-install'>
			<Copyable label='Install' code={`npm install ${packageJson.name}`} />
			{!tag ? null : <Copyable label='Import' code={`import '${packageJson.name}'`} />}
		</div>
	)
}

/** The primary story with a control for each argument it declares. */
export function Playground() {
	const context = useContext(DocsContext)
	const [primary] = context.componentStories()
	const controllable = Object.keys(primary?.initialArgs ?? {})
		.filter(name => {
			const argType = primary?.argTypes[name] as any
			return argType?.control && !argType.table?.disable
		})
	return (
		<>
			<Primary />
			{!controllable.length ? null : <Controls include={controllable} />}
		</>
	)
}

/** The roles, states and keys of the element, or of the controller a Behaviors page names in its meta's `parameters.controller`. */
export function Accessibility() {
	const { tag, controller } = usePage()
	const manifest = getCustomElements()
	const text: string | undefined = tag
		? manifest?.tags?.find((t: any) => t.name === tag)?.accessibility
		: !controller ? undefined : manifest?.accessibility?.[controller]
	return !text ? null : (
		<section className='docs-accessibility'>
			<Heading>Accessibility</Heading>
			<Markdown>{text}</Markdown>
		</section>
	)
}

/** The element's attributes, properties, events, slots, custom properties and parts, from the manifest. */
export function Api() {
	const { tag } = usePage()
	return !tag ? null : (
		<>
			<Heading>API</Heading>
			<ArgTypes />
		</>
	)
}

/** The package's changelog, generated from its commits. */
export function Changelog() {
	const { directory } = usePage()
	const load = !directory ? undefined : changelogs[`../${directory}/CHANGELOG.md`]
	const [content, setContent] = useState<string>()
	useEffect(() => void load?.().then(setContent), [load])
	return !content?.trim() ? null : (
		<section className='docs-changelog'>
			<Heading>Changelog</Heading>
			<Markdown>{content.replace(/^## /gm, '### ')}</Markdown>
		</section>
	)
}