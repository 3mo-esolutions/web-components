import { TemplateResult } from '@a11d/lit'
import { DialogSize } from '@3mo/dialog'

type Content = undefined | string | TemplateResult | (() => string | TemplateResult)

export type BaseDialogParameters = {
	readonly heading: string
	readonly content?: Content
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
}

export function getContentTemplate(content: Content) {
	return typeof content === 'function' ? content() : content ?? ''
}