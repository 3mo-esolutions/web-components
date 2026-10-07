import { addons } from 'storybook/manager-api'
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { resolveScheme, themes } from './theme.ts'
import './litLanguage.ts'

addons.setConfig({
	enableShortcuts: false,
	theme: themes[resolveScheme('system')],
})

addons.register('3mo/theme', api => {
	let preference: unknown = 'system'
	const apply = () => api.setOptions({ theme: themes[resolveScheme(preference)] })
	const handleGlobals = ({ globals }: { globals: Record<string, unknown> }) => {
		preference = globals.theme ?? 'system'
		apply()
	}
	api.on(SET_GLOBALS, handleGlobals)
	api.on(GLOBALS_UPDATED, handleGlobals)
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply)
})
