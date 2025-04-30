import { type HTMLTemplateResult } from '@a11d/lit'
import type { DialogSize } from './Dialog.js'
import { type DialogComponent } from '@a11d/lit-application'

export type DialogContent<Dialog extends DialogComponent<any, any>> = undefined | string | HTMLTemplateResult | ((this: Dialog) => string | HTMLTemplateResult)

export interface BaseDialogParameters<Dialog extends DialogComponent<any, any>> {
	readonly heading?: string
	readonly content?: DialogContent<Dialog>
	readonly primaryButtonText?: string
	readonly blocking?: boolean
	readonly size?: DialogSize
}

export const getContentTemplate = <Dialog extends DialogComponent<any, any>>(context: Dialog, content: DialogContent<Dialog>, defaultValue: HTMLTemplateResult | string = '') => {
	return typeof content === 'function' ? content.call(context) : content ?? defaultValue
}