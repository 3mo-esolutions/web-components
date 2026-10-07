import type { Decorator, Preview } from '@storybook/web-components-vite'
import { Theme } from '@3mo/theme'
import { Localizer, type LanguageCode } from '@3mo/localization'

const applied = new Map<string, unknown>()

/** Applies the toolbar's theme and language to the library. */
export function applyGlobals(globals: Record<string, unknown>) {
	if ('theme' in globals && applied.get('theme') !== globals.theme) {
		applied.set('theme', globals.theme)
		Theme.background.value = globals.theme === 'light' || globals.theme === 'dark' ? globals.theme as any : undefined
	}
	if ('locale' in globals && applied.get('locale') !== globals.locale) {
		applied.set('locale', globals.locale)
		Localizer.languages.current = globals.locale as LanguageCode
	}
}

export const globalTypes: Preview['globalTypes'] = {
	theme: {
		description: 'Color scheme',
		toolbar: {
			title: 'Theme',
			icon: 'mirror',
			dynamicTitle: true,
			items: [
				{ value: 'system', title: 'System', icon: 'browser' },
				{ value: 'light', title: 'Light', icon: 'sun' },
				{ value: 'dark', title: 'Dark', icon: 'moon' },
			],
		},
	},
	locale: {
		description: 'Language and writing direction',
		toolbar: {
			title: 'Language',
			icon: 'globe',
			dynamicTitle: true,
			items: [
				{ value: 'en', title: 'English' },
				{ value: 'de', title: 'Deutsch' },
				{ value: 'fa', title: 'فارسی', right: 'RTL' },
			],
		},
	},
}

export const initialGlobals = {
	theme: 'system',
	locale: 'en',
}

export const decorators: Array<Decorator> = [
	(story, { globals }) => {
		applyGlobals(globals)
		return story()
	},
]
