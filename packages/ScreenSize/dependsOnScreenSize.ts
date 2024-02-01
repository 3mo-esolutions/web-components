import { AsyncDirective, directive, type PartInfo, PartType } from '@3mo/del'

type AtLeastOneOf<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export const enum ScreenSize {
	Mobile = 'mobile',
	Tablet = 'tablet',
	Desktop = 'desktop',
}

export type ScreenSizeKey = 'mobile' | 'tablet' | 'desktop'

export type ScreenSizeDefinitions = AtLeastOneOf<{
	readonly [ScreenSize.Mobile]: unknown
	readonly [ScreenSize.Tablet]: unknown
	readonly [ScreenSize.Desktop]: unknown
}>

type MediaQueryListener = (event: MediaQueryListEvent) => void

export class DependsOnScreenSizeDirective extends AsyncDirective {
	protected static readonly supportedPartTypes = [PartType.PROPERTY, PartType.ATTRIBUTE, PartType.BOOLEAN_ATTRIBUTE, PartType.CHILD] as Array<PartType>

	protected static readonly media = {
		[ScreenSize.Mobile]: window.matchMedia('(max-width: 768px)'),
		[ScreenSize.Tablet]: window.matchMedia('(min-width: 768px) and (max-width: 1024px)'),
		[ScreenSize.Desktop]: window.matchMedia('(min-width: 1024px)'),
		addEventListener(listener: MediaQueryListener) {
			this[ScreenSize.Mobile].addEventListener('change', listener)
			this[ScreenSize.Tablet].addEventListener('change', listener)
			this[ScreenSize.Desktop].addEventListener('change', listener)
		},
		removeEventListener(listener: MediaQueryListener) {
			this[ScreenSize.Mobile].removeEventListener('change', listener)
			this[ScreenSize.Tablet].removeEventListener('change', listener)
			this[ScreenSize.Desktop].removeEventListener('change', listener)
		},
	}

	protected definitions!: ScreenSizeDefinitions

	constructor(partInfo: PartInfo) {
		super(partInfo)
		if ((this.constructor as typeof DependsOnScreenSizeDirective).supportedPartTypes.includes(partInfo.type) === false) {
			throw new Error('Directive not supported on this part type.')
		}
		DependsOnScreenSizeDirective.media.addEventListener(this.handleChangeListener)
	}

	render(definitions: ScreenSizeDefinitions) {
		this.definitions = definitions
		switch (true) {
			case DependsOnScreenSizeDirective.media[ScreenSize.Mobile].matches:
				return definitions[ScreenSize.Mobile] ?? definitions[ScreenSize.Tablet] ?? definitions[ScreenSize.Desktop]
			case DependsOnScreenSizeDirective.media[ScreenSize.Tablet].matches:
				return definitions[ScreenSize.Tablet] ?? definitions[ScreenSize.Desktop]
			default:
				return definitions[ScreenSize.Desktop]
		}
	}

	override disconnected() {
		DependsOnScreenSizeDirective.media.removeEventListener(this.handleChangeListener)
	}

	protected handleChange() {
		this.setValue(this.render(this.definitions))
	}

	private readonly handleChangeListener = () => this.handleChange()
}

export const dependsOnScreenSize = directive(DependsOnScreenSizeDirective)