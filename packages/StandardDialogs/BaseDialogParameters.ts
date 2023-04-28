import { TemplateResult } from '@a11d/lit'
import { DialogSize } from '@3mo/dialog'

export type BaseDialogParameters = {
	readonly heading: string
	readonly content?: string | TemplateResult
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
}