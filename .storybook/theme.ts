import { create } from 'storybook/theming'

export type Scheme = 'light' | 'dark'

const mark = '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="3" fill="#0077c8"/><svg x="3" y="3" width="30" height="30" viewBox="0 0 247 123"><path d="m193.935,16.623c-14.048,0 -26.129,5.381 -34.652,14.001l0,-12.463l-21.304,0l-23.615,37.987l-23.612,-37.987l-78.539,0l0,16.942l35.288,0l-21.427,21.56l3.077,12.575l8.212,0c11.038,0 17.584,4.106 17.584,11.424l0,0.253c0,6.677 -5.262,10.911 -12.708,10.911c-9.108,0 -15.525,-3.851 -21.687,-10.778l-13.602,12.963c7.703,9.109 18.866,15.524 35.037,15.524c12.577,0 22.109,-4.92 27.462,-12.772l0,11.23l19.375,0l0,-58.258l25.03,37.979l0.509,0l25.287,-38.364l0,58.643l19.632,0l0,-12.189c8.449,8.474 20.423,13.731 34.394,13.731c27.723,0 47.873,-20.916 47.873,-46.455l0,-0.257c0,-25.541 -19.895,-46.2 -47.614,-46.2m-143.736,38.118l19.25,-18.388l0,28.241c-4.601,-5.752 -11.869,-8.615 -19.25,-9.853m170.684,8.598c0,15.394 -11.034,27.969 -26.948,27.969c-15.915,0 -27.21,-12.824 -27.21,-28.228l0,-0.257c0,-15.401 11.041,-27.977 26.951,-27.977c15.911,0 27.207,12.83 27.207,28.233l0,0.26z" fill="white"/></svg></svg>'

const brandTitle = `<span style="display: inline-flex; align-items: center; gap: 12px; font: 500 17px/1 Roboto, sans-serif; letter-spacing: -0.01em; white-space: nowrap">${mark}<span>Web Components</span></span>`

const brand = {
	brandTitle,
	brandImage: null as unknown as string,
	brandUrl: 'https://3mo.de',
	brandTarget: '_self',
	fontBase: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
	fontCode: '"Cascadia Code", "Fira Code", Consolas, monospace',
	appBorderRadius: 10,
	inputBorderRadius: 8,
}

export const themes: Record<Scheme, ReturnType<typeof create>> = {
	light: create({
		...brand,
		base: 'light',
		colorPrimary: '#0077c8',
		colorSecondary: '#0077c8',
		appBg: '#f4f5f7',
		appContentBg: '#ffffff',
		appPreviewBg: '#ffffff',
		appBorderColor: 'rgba(15, 23, 42, 0.09)',
		textColor: '#15171c',
		textMutedColor: '#5d6470',
		textInverseColor: '#ffffff',
		barBg: '#ffffff',
		barTextColor: '#5d6470',
		barSelectedColor: '#0077c8',
		barHoverColor: '#0077c8',
		inputBg: '#ffffff',
		inputBorder: 'rgba(15, 23, 42, 0.14)',
		inputTextColor: '#15171c',
	}),
	dark: create({
		...brand,
		base: 'dark',
		colorPrimary: '#4ea8f0',
		colorSecondary: '#4ea8f0',
		appBg: '#0e0f12',
		appContentBg: '#131418',
		appPreviewBg: '#131418',
		appBorderColor: 'rgba(255, 255, 255, 0.08)',
		textColor: '#e8eaee',
		textMutedColor: '#9aa1ad',
		textInverseColor: '#0e0f12',
		barBg: '#131418',
		barTextColor: '#9aa1ad',
		barSelectedColor: '#4ea8f0',
		barHoverColor: '#4ea8f0',
		inputBg: '#1a1b20',
		inputBorder: 'rgba(255, 255, 255, 0.12)',
		inputTextColor: '#e8eaee',
	}),
}

export type ThemePreference = 'system' | Scheme

export function resolveScheme(preference: unknown): Scheme {
	return preference === 'light' || preference === 'dark'
		? preference
		: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}