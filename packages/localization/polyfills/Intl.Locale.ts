/** The direction is missing for a language the engine has no data for. */
export type TextInfo = { readonly direction?: 'ltr' | 'rtl' }
export type WeekInfo = { readonly firstDay: number, readonly weekend: ReadonlyArray<number> }

declare global {
	namespace Intl {
		interface Locale {
			/** The text direction the locale is written in. */
			getTextInfo(): TextInfo
			/** The day a week starts on and the weekend days, from 1 for Monday through 7 for Sunday. */
			getWeekInfo(): WeekInfo
		}
	}
}

// Both tables are Chromium 153's answers over every script and region, as CLDR data on engines without the methods.
const rightToLeftScripts = new Set('Adlm Arab Armi Avst Chrs Cprt Elym Gara Hatr Hebr Hung Khar Lydi Mand Mani Mend Merc Mero Narb Nbat Nkoo Orkh Ougr Palm Phli Phlp Phnx Prti Rohg Samr Sarb Sidt Sogd Sogo Syrc Thaa Yezi'.split(' '))

const defaultWeekInfo: WeekInfo = { firstDay: 1, weekend: [6, 7] }
const weekInfoByRegion = new Map<string, WeekInfo>()
const defineWeekInfo = (firstDay: number, weekend: ReadonlyArray<number>, regions: string) => regions.split(' ').forEach(region => weekInfoByRegion.set(region, { firstDay, weekend }))
defineWeekInfo(7, [6, 7], 'AG AS BD BR BS BT BU BW BZ CA CO DM DO ET GT GU HK HN ID IS JM JP JT KE KH KR LA MH MI MM MO MT MX MZ NI NP PA PE PH PK PR PT PU PY PZ RH SG SV TH TT TW UM US VE VI WK WS ZA ZW')
defineWeekInfo(7, [5, 6], 'IL NT SA YD YE')
defineWeekInfo(7, [7], 'IN')
defineWeekInfo(6, [5, 6], 'BH DZ EG IQ JO KW LY OM QA SD SY')
defineWeekInfo(6, [4, 5], 'AF')
defineWeekInfo(6, [5], 'IR')
defineWeekInfo(6, [6, 7], 'DJ')
defineWeekInfo(5, [6, 7], 'MV')
defineWeekInfo(1, [7], 'UG')

type LocaleWithInfoGetters = Intl.Locale & { readonly textInfo?: TextInfo, readonly weekInfo?: WeekInfo }

export function getTextInfo(this: Intl.Locale): TextInfo {
	return (this as LocaleWithInfoGetters).textInfo
		?? { direction: rightToLeftScripts.has(this.maximize().script ?? '') ? 'rtl' : 'ltr' }
}

export function getWeekInfo(this: Intl.Locale): WeekInfo {
	return (this as LocaleWithInfoGetters).weekInfo
		?? weekInfoByRegion.get(this.maximize().region ?? '')
		?? defaultWeekInfo
}

// Firefox before 153 has neither the methods nor the getters Chrome 99 and Safari 15.4 first shipped them as.
if (typeof Intl.Locale.prototype.getTextInfo !== 'function') {
	Intl.Locale.prototype.getTextInfo = getTextInfo
}
if (typeof Intl.Locale.prototype.getWeekInfo !== 'function') {
	Intl.Locale.prototype.getWeekInfo = getWeekInfo
}
