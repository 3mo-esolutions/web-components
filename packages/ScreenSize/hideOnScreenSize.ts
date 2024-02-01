import { noChange, type PartInfo, PartType, directive } from '@3mo/del'
import { DependsOnScreenSizeDirective, ScreenSizeKey } from './dependsOnScreenSize.js'

export class HideOnScreenSizeDirective extends DependsOnScreenSizeDirective {
	protected static override readonly supportedPartTypes = [PartType.ELEMENT]

	private element!: HTMLElement
	private screenSizes = new Array<ScreenSizeKey>()

	constructor(partInfo: PartInfo) {
		super(partInfo)
		// @ts-expect-error - partInfo.element is not defined in the type
		this.element = partInfo.element as HTMLElement
		this.handleChange()
	}

	// @ts-expect-error - Overriding the signature
	override render(...screenSizes: Array<ScreenSizeKey>) {
		this.screenSizes = screenSizes
		this.handleChange()
		return noChange
	}

	protected override handleChange() {
		const matches = this.screenSizes.some(screenSize => DependsOnScreenSizeDirective.media[screenSize].matches)
		this.element.style.display = matches ? 'none' : ''
	}
}

export const hideOnScreenSize = directive(HideOnScreenSizeDirective)