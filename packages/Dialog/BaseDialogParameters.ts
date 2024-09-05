import { type TemplateResult } from '@a11d/lit'
import type { DialogSize } from './Dialog.js'
import { type DialogComponent } from '@a11d/lit-application'

export type DialogContent<Dialog extends DialogComponent<any, any>> = undefined | string | TemplateResult | ((this: Dialog) => string | TemplateResult)

export interface BaseDialogParameters<Dialog extends DialogComponent<any, any>> {
	readonly heading: string
	readonly content?: DialogContent<Dialog>
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
}

export const getContentTemplate = <Dialog extends DialogComponent<any, any>>(context: Dialog, content: DialogContent<Dialog>) => {
	return typeof content === 'function' ? content.call(context) : content ?? ''
}