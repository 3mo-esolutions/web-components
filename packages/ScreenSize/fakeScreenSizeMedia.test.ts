import { DependsOnScreenSizeDirective, ScreenSize } from './dependsOnScreenSize.js'

export class FakeMediaQueryList extends EventTarget {
	matches = false

	change(matches: boolean) {
		this.matches = matches
		this.dispatchEvent(new Event('change'))
	}
}

export const fakeScreenSizeMedia = () => {
	const media = DependsOnScreenSizeDirective.media as unknown as Record<ScreenSize, MediaQueryList | undefined>
	const original = { ...media } as Record<ScreenSize, MediaQueryList | undefined>
	const fakes = {
		[ScreenSize.Mobile]: new FakeMediaQueryList,
		[ScreenSize.Tablet]: new FakeMediaQueryList,
		[ScreenSize.Desktop]: new FakeMediaQueryList,
	}

	beforeEach(() => {
		for (const screenSize of Object.values(ScreenSize)) {
			fakes[screenSize].matches = false
			media[screenSize] = fakes[screenSize] as unknown as MediaQueryList
		}
	})

	afterEach(() => {
		for (const screenSize of Object.values(ScreenSize)) {
			media[screenSize] = original[screenSize]
		}
	})

	return {
		...fakes,
		match(screenSize?: ScreenSize) {
			for (const each of Object.values(ScreenSize)) {
				fakes[each].matches = each === screenSize
			}
		},
	}
}