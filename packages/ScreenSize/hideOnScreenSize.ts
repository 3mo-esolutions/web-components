import { noChange, type PartInfo, PartType, directive } from '@a11d/lit'
import { DependsOnScreenSizeDirective, type ScreenSizeKey } from './dependsOnScreenSize.js'

export class HideOnScreenSizeDirective extends DependsOnScreenSizeDirective {
	private readonly element!: HTMLElement
	private screenSizes = new Array<ScreenSizeKey>()

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error('Directive not supported on this part type.')
		}
		// @ts-expect-error - partInfo.element is not defined in the type
		this.element = partInfo.element as HTMLElement
		this.handleEvent()
	}

	// @ts-expect-error - Overriding the signature
	override render(...screenSizes: Array<ScreenSizeKey>) {
		this.screenSizes = screenSizes
		this.handleEvent()
		return noChange
	}

	override handleEvent() {
		const matches = this.screenSizes.some(screenSize => DependsOnScreenSizeDirective.media[screenSize]?.matches ?? false)
		this.element.style.display = matches ? 'none' : ''
	}
}

export const hideOnScreenSize = directive(HideOnScreenSizeDirective)