import { AsyncDirective, directive, type PartInfo, isServer } from '@a11d/lit'

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

export class DependsOnScreenSizeDirective extends AsyncDirective {
	static readonly media = {
		[ScreenSize.Mobile]: isServer ? undefined : window.matchMedia('(max-width: 640px)'),
		[ScreenSize.Tablet]: isServer ? undefined : window.matchMedia('(min-width: 640px) and (max-width: 1024px)'),
		[ScreenSize.Desktop]: isServer ? undefined : window.matchMedia('(min-width: 1024px)'),
		addEventListener(listener: EventListenerOrEventListenerObject) {
			this[ScreenSize.Mobile]?.addEventListener('change', listener)
			this[ScreenSize.Tablet]?.addEventListener('change', listener)
			this[ScreenSize.Desktop]?.addEventListener('change', listener)
		},
		removeEventListener(listener: EventListenerOrEventListenerObject) {
			this[ScreenSize.Mobile]?.removeEventListener('change', listener)
			this[ScreenSize.Tablet]?.removeEventListener('change', listener)
			this[ScreenSize.Desktop]?.removeEventListener('change', listener)
		},
	}

	protected definitions!: ScreenSizeDefinitions

	constructor(partInfo: PartInfo) {
		super(partInfo)
		DependsOnScreenSizeDirective.media.addEventListener(this)
	}

	render(definitions: ScreenSizeDefinitions) {
		this.definitions = definitions
		switch (true) {
			case DependsOnScreenSizeDirective.media[ScreenSize.Mobile]?.matches:
				return definitions[ScreenSize.Mobile] ?? definitions[ScreenSize.Tablet] ?? definitions[ScreenSize.Desktop]
			case DependsOnScreenSizeDirective.media[ScreenSize.Tablet]?.matches:
				return definitions[ScreenSize.Tablet] ?? definitions[ScreenSize.Desktop]
			default:
				return definitions[ScreenSize.Desktop]
		}
	}

	override disconnected() {
		DependsOnScreenSizeDirective.media.removeEventListener(this)
	}

	handleEvent() {
		this.setValue(this.render(this.definitions))
	}
}

export const dependsOnScreenSize = directive(DependsOnScreenSizeDirective)