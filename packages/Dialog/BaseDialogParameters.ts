import { TemplateResult } from '@a11d/lit'
import type { DialogSize } from './Dialog.js'
import { DialogComponent } from '@a11d/lit-application'

type Content<Dialog extends DialogComponent<any, any>> = undefined | string | TemplateResult | ((this: Dialog) => string | TemplateResult)

export interface BaseDialogParameters<Dialog extends DialogComponent<any, any>> {
	readonly heading: string
	readonly content?: Content<Dialog>
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
}

export const getContentTemplate = <Dialog extends DialogComponent<any, any>>(context: Dialog, content: Content<Dialog>) => {
	return typeof content === 'function' ? content.call(context) : content ?? ''
}