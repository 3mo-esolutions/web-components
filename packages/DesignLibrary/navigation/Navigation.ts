import { TemplateResult } from '@a11d/lit'
import { PageComponent, DialogComponent, RouteMatchMode } from '@a11d/lit-application'
import { MaterialIcon } from '@3mo/icon'

export type Navigation = {
	key?: string
	label: string | TemplateResult
	icon?: MaterialIcon
	hidden?: boolean
	openInNewPage?: boolean
	component?: PageComponent<any> | DialogComponent<any, any>
	matchMode?: RouteMatchMode
	children?: Array<Navigation>
	line?: boolean
}