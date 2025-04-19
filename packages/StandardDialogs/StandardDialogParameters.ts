import { type DialogComponent } from '@a11d/lit-application'
import { type BaseDialogParameters } from '@3mo/dialog'

export interface StandardDialogParameters<Dialog extends DialogComponent<any, any>> extends BaseDialogParameters<Dialog> {
	readonly heading: string
}