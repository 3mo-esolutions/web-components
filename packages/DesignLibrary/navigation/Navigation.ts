import { type TemplateResult } from '@a11d/lit'
import { type PageComponent, type DialogComponent, type RouteMatchMode } from '@a11d/lit-application'
import { type MaterialIcon } from '@3mo/icon'

export type Navigation = {
	key?: string
	label: string | TemplateResult
	icon?: MaterialIcon
	hidden?: boolean
	openInNewPage?: boolean
	component?: PageComponent<any> | DialogComponent<any, any>
	matchMode?: RouteMatchMode
	children?: Array<Navigation>
	/** If true, a separator will be rendered before this item. */
	hasSeparator?: boolean
}