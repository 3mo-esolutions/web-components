import { ReactiveElement } from '@a11d/lit'
import type { PopoverPlacement } from './PopoverPlacement.js'

export interface PopoverComponent extends ReactiveElement {
	readonly anchor: HTMLElement
	readonly placement: PopoverPlacement
	open: boolean
}