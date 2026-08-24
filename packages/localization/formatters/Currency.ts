import { Localizer } from '../Localizer.js'

const currencyCodes = ['BTC', 'AFN', 'EUR', 'ALL', 'DZD', 'USD', 'AOA', 'XCD', 'ARS', 'AMD', 'AWG', 'AUD', 'AZN', 'BSD', 'BHD', 'BDT', 'BBD', 'BYN', 'BZD', 'XOF', 'BMD', 'INR', 'BTN', 'BOB', 'BOV', 'BAM', 'BWP', 'NOK', 'BRL', 'BND', 'BGN', 'BIF', 'CVE', 'KHR', 'XAF', 'CAD', 'KYD', 'CLP', 'CLF', 'CNY', 'COP', 'COU', 'KMF', 'CDF', 'NZD', 'CRC', 'CUP', 'CUC', 'ANG', 'XCG', 'CZK', 'DKK', 'DJF', 'DOP', 'EGP', 'SVC', 'ERN', 'SZL', 'ETB', 'FKP', 'FJD', 'XPF', 'GMD', 'GEL', 'GHS', 'GIP', 'GTQ', 'GBP', 'GNF', 'GYD', 'HTG', 'HNL', 'HKD', 'HUF', 'ISK', 'IDR', 'XDR', 'IRR', 'IQD', 'ILS', 'JMD', 'JPY', 'JOD', 'KZT', 'KES', 'KPW', 'KRW', 'KWD', 'KGS', 'LAK', 'LBP', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'MOP', 'MKD', 'MGA', 'MWK', 'MYR', 'MVR', 'MRU', 'MUR', 'XUA', 'MXN', 'MXV', 'MDL', 'MNT', 'MAD', 'MZN', 'MMK', 'NAD', 'NPR', 'NIO', 'NGN', 'OMR', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PHP', 'PLN', 'QAR', 'RON', 'RUB', 'RWF', 'SHP', 'WST', 'STN', 'SAR', 'RSD', 'SCR', 'SLL', 'SGD', 'XSU', 'SBD', 'SOS', 'SSP', 'LKR', 'SDG', 'SRD', 'SEK', 'CHE', 'CHW', 'SYP', 'SLE', 'TWD', 'TJS', 'TZS', 'THB', 'TOP', 'TTD', 'TND', 'TRY', 'TMT', 'UGX', 'UAH', 'AED', 'USN', 'UYU', 'UYI', 'UYW', 'UZS', 'VUV', 'VES', 'VED', 'VND', 'YER', 'ZMW', 'ZWL', 'ZWG', 'XBA', 'XBB', 'XBC', 'XBD', 'XTS', 'XXX', 'XAU', 'XPD', 'XPT', 'XAG'] as const

export type CurrencyCode = typeof currencyCodes[number]

export class Currency {
	static {
		for (const code of currencyCodes) {
			Object.defineProperty(Currency, code, {
				get() { return new Currency(code) }
			})
		}
	}

	readonly code: CurrencyCode

	constructor(code: CurrencyCode) {
		this.code = code.toUpperCase() as CurrencyCode
		if (!currencyCodes.includes(this.code)) {
			throw new Error(`Invalid currency code: ${this.code}`)
		}
	}

	toString() { return this.code }

	valueOf() { return this.code }

	get symbol() { return this.getSymbol() }

	/**
	 * The symbol the given language writes this currency with, falling back to the code itself.
	 * Symbols are language-specific: `CNY` is `¥` in Chinese but `CN¥` in German.
	 */
	getSymbol(language = Localizer.languages.current) {
		try {
			return Intl.NumberFormat(language, { style: 'currency', currency: this.code, maximumFractionDigits: 0 })
				.formatToParts(0)
				.find(part => part.type === 'currency')
				?.value ?? this.code
		} catch {
			return this.code
		}
	}

	// #region Pre-defined currencies
	/** Bitcoin */
	static readonly BTC: Currency
	/** Afghan Afghani */
	static readonly AFN: Currency
	/** Euro */
	static readonly EUR: Currency
	/** Albanian Lek */
	static readonly ALL: Currency
	/** Algerian Dinar */
	static readonly DZD: Currency
	/** US Dollar */
	static readonly USD: Currency
	/** Angolan Kwanza */
	static readonly AOA: Currency
	/** East Caribbean Dollar */
	static readonly XCD: Currency
	/** Argentine Peso */
	static readonly ARS: Currency
	/** Armenian Dram */
	static readonly AMD: Currency
	/** Aruban Florin */
	static readonly AWG: Currency
	/** Australian Dollar */
	static readonly AUD: Currency
	/** Azerbaijani Manat */
	static readonly AZN: Currency
	/** Bahamian Dollar */
	static readonly BSD: Currency
	/** Bahraini Dinar */
	static readonly BHD: Currency
	/** Bangladeshi Taka */
	static readonly BDT: Currency
	/** Barbadian Dollar */
	static readonly BBD: Currency
	/** Belarusian Ruble */
	static readonly BYN: Currency
	/** Belize Dollar */
	static readonly BZD: Currency
	/** West African CFA Franc */
	static readonly XOF: Currency
	/** Bermudan Dollar */
	static readonly BMD: Currency
	/** Indian Rupee */
	static readonly INR: Currency
	/** Bhutanese Ngultrum */
	static readonly BTN: Currency
	/** Bolivian Boliviano */
	static readonly BOB: Currency
	/** Bolivian Mvdol */
	static readonly BOV: Currency
	/** Bosnia-Herzegovina Convertible Mark */
	static readonly BAM: Currency
	/** Botswanan Pula */
	static readonly BWP: Currency
	/** Norwegian Krone */
	static readonly NOK: Currency
	/** Brazilian Real */
	static readonly BRL: Currency
	/** Brunei Dollar */
	static readonly BND: Currency
	/** Bulgarian Lev */
	static readonly BGN: Currency
	/** Burundian Franc */
	static readonly BIF: Currency
	/** Cape Verdean Escudo */
	static readonly CVE: Currency
	/** Cambodian Riel */
	static readonly KHR: Currency
	/** Central African CFA Franc */
	static readonly XAF: Currency
	/** Canadian Dollar */
	static readonly CAD: Currency
	/** Cayman Islands Dollar */
	static readonly KYD: Currency
	/** Chilean Peso */
	static readonly CLP: Currency
	/** Chilean Unit of Account (UF) */
	static readonly CLF: Currency
	/** Chinese Yuan */
	static readonly CNY: Currency
	/** Colombian Peso */
	static readonly COP: Currency
	/** Colombian Real Value Unit */
	static readonly COU: Currency
	/** Comorian Franc */
	static readonly KMF: Currency
	/** Congolese Franc */
	static readonly CDF: Currency
	/** New Zealand Dollar */
	static readonly NZD: Currency
	/** Costa Rican Colón */
	static readonly CRC: Currency
	/** Cuban Peso */
	static readonly CUP: Currency
	/** Cuban Convertible Peso */
	static readonly CUC: Currency
	/** Netherlands Antillean Guilder */
	static readonly ANG: Currency
	/** Caribbean guilder */
	static readonly XCG: Currency
	/** Czech Koruna */
	static readonly CZK: Currency
	/** Danish Krone */
	static readonly DKK: Currency
	/** Djiboutian Franc */
	static readonly DJF: Currency
	/** Dominican Peso */
	static readonly DOP: Currency
	/** Egyptian Pound */
	static readonly EGP: Currency
	/** Salvadoran Colón */
	static readonly SVC: Currency
	/** Eritrean Nakfa */
	static readonly ERN: Currency
	/** Swazi Lilangeni */
	static readonly SZL: Currency
	/** Ethiopian Birr */
	static readonly ETB: Currency
	/** Falkland Islands Pound */
	static readonly FKP: Currency
	/** Fijian Dollar */
	static readonly FJD: Currency
	/** CFP Franc */
	static readonly XPF: Currency
	/** Gambian Dalasi */
	static readonly GMD: Currency
	/** Georgian Lari */
	static readonly GEL: Currency
	/** Ghanaian Cedi */
	static readonly GHS: Currency
	/** Gibraltar Pound */
	static readonly GIP: Currency
	/** Guatemalan Quetzal */
	static readonly GTQ: Currency
	/** British Pound */
	static readonly GBP: Currency
	/** Guinean Franc */
	static readonly GNF: Currency
	/** Guyanaese Dollar */
	static readonly GYD: Currency
	/** Haitian Gourde */
	static readonly HTG: Currency
	/** Honduran Lempira */
	static readonly HNL: Currency
	/** Hong Kong Dollar */
	static readonly HKD: Currency
	/** Hungarian Forint */
	static readonly HUF: Currency
	/** Icelandic Króna */
	static readonly ISK: Currency
	/** Indonesian Rupiah */
	static readonly IDR: Currency
	/** Special Drawing Rights */
	static readonly XDR: Currency
	/** Iranian Rial */
	static readonly IRR: Currency
	/** Iraqi Dinar */
	static readonly IQD: Currency
	/** Israeli New Shekel */
	static readonly ILS: Currency
	/** Jamaican Dollar */
	static readonly JMD: Currency
	/** Japanese Yen */
	static readonly JPY: Currency
	/** Jordanian Dinar */
	static readonly JOD: Currency
	/** Kazakhstani Tenge */
	static readonly KZT: Currency
	/** Kenyan Shilling */
	static readonly KES: Currency
	/** North Korean Won */
	static readonly KPW: Currency
	/** South Korean Won */
	static readonly KRW: Currency
	/** Kuwaiti Dinar */
	static readonly KWD: Currency
	/** Kyrgyz Som */
	static readonly KGS: Currency
	/** Laotian Kip */
	static readonly LAK: Currency
	/** Lebanese Pound */
	static readonly LBP: Currency
	/** Lesotho Loti */
	static readonly LSL: Currency
	/** South African Rand */
	static readonly ZAR: Currency
	/** Liberian Dollar */
	static readonly LRD: Currency
	/** Libyan Dinar */
	static readonly LYD: Currency
	/** Swiss Franc */
	static readonly CHF: Currency
	/** Macanese Pataca */
	static readonly MOP: Currency
	/** Macedonian Denar */
	static readonly MKD: Currency
	/** Malagasy Ariary */
	static readonly MGA: Currency
	/** Malawian Kwacha */
	static readonly MWK: Currency
	/** Malaysian Ringgit */
	static readonly MYR: Currency
	/** Maldivian Rufiyaa */
	static readonly MVR: Currency
	/** Mauritanian Ouguiya */
	static readonly MRU: Currency
	/** Mauritian Rupee */
	static readonly MUR: Currency
	/** ADB Unit of Account */
	static readonly XUA: Currency
	/** Mexican Peso */
	static readonly MXN: Currency
	/** Mexican Investment Unit */
	static readonly MXV: Currency
	/** Moldovan Leu */
	static readonly MDL: Currency
	/** Mongolian Tugrik */
	static readonly MNT: Currency
	/** Moroccan Dirham */
	static readonly MAD: Currency
	/** Mozambican Metical */
	static readonly MZN: Currency
	/** Myanmar Kyat */
	static readonly MMK: Currency
	/** Namibian Dollar */
	static readonly NAD: Currency
	/** Nepalese Rupee */
	static readonly NPR: Currency
	/** Nicaraguan Córdoba */
	static readonly NIO: Currency
	/** Nigerian Naira */
	static readonly NGN: Currency
	/** Omani Rial */
	static readonly OMR: Currency
	/** Pakistani Rupee */
	static readonly PKR: Currency
	/** Panamanian Balboa */
	static readonly PAB: Currency
	/** Papua New Guinean Kina */
	static readonly PGK: Currency
	/** Paraguayan Guarani */
	static readonly PYG: Currency
	/** Peruvian Sol */
	static readonly PEN: Currency
	/** Philippine Peso */
	static readonly PHP: Currency
	/** Polish Zloty */
	static readonly PLN: Currency
	/** Qatari Riyal */
	static readonly QAR: Currency
	/** Romanian Leu */
	static readonly RON: Currency
	/** Russian Ruble */
	static readonly RUB: Currency
	/** Rwandan Franc */
	static readonly RWF: Currency
	/** St. Helena Pound */
	static readonly SHP: Currency
	/** Samoan Tala */
	static readonly WST: Currency
	/** São Tomé & Príncipe Dobra */
	static readonly STN: Currency
	/** Saudi Riyal */
	static readonly SAR: Currency
	/** Serbian Dinar */
	static readonly RSD: Currency
	/** Seychellois Rupee */
	static readonly SCR: Currency
	/** Sierra Leonean Leone (1964—2022) */
	static readonly SLL: Currency
	/** Singapore Dollar */
	static readonly SGD: Currency
	/** Sucre */
	static readonly XSU: Currency
	/** Solomon Islands Dollar */
	static readonly SBD: Currency
	/** Somali Shilling */
	static readonly SOS: Currency
	/** South Sudanese Pound */
	static readonly SSP: Currency
	/** Sri Lankan Rupee */
	static readonly LKR: Currency
	/** Sudanese Pound */
	static readonly SDG: Currency
	/** Surinamese Dollar */
	static readonly SRD: Currency
	/** Swedish Krona */
	static readonly SEK: Currency
	/** WIR Euro */
	static readonly CHE: Currency
	/** WIR Franc */
	static readonly CHW: Currency
	/** Syrian Pound */
	static readonly SYP: Currency
	/** Sierra Leonean Leone */
	static readonly SLE: Currency
	/** New Taiwan Dollar */
	static readonly TWD: Currency
	/** Tajikistani Somoni */
	static readonly TJS: Currency
	/** Tanzanian Shilling */
	static readonly TZS: Currency
	/** Thai Baht */
	static readonly THB: Currency
	/** Tongan Paʻanga */
	static readonly TOP: Currency
	/** Trinidad & Tobago Dollar */
	static readonly TTD: Currency
	/** Tunisian Dinar */
	static readonly TND: Currency
	/** Turkish Lira */
	static readonly TRY: Currency
	/** Turkmenistani Manat */
	static readonly TMT: Currency
	/** Ugandan Shilling */
	static readonly UGX: Currency
	/** Ukrainian Hryvnia */
	static readonly UAH: Currency
	/** United Arab Emirates Dirham */
	static readonly AED: Currency
	/** US Dollar (Next day) */
	static readonly USN: Currency
	/** Uruguayan Peso */
	static readonly UYU: Currency
	/** Uruguayan Peso (Indexed Units) */
	static readonly UYI: Currency
	/** Uruguayan Nominal Wage Index Unit */
	static readonly UYW: Currency
	/** Uzbekistani Som */
	static readonly UZS: Currency
	/** Vanuatu Vatu */
	static readonly VUV: Currency
	/** Venezuelan Bolívar */
	static readonly VES: Currency
	/** Bolívar Soberano */
	static readonly VED: Currency
	/** Vietnamese Dong */
	static readonly VND: Currency
	/** Yemeni Rial */
	static readonly YER: Currency
	/** Zambian Kwacha */
	static readonly ZMW: Currency
	/** Zimbabwean Dollar (2009–2024) */
	static readonly ZWL: Currency
	/** Zimbabwean Gold */
	static readonly ZWG: Currency
	/** European Composite Unit */
	static readonly XBA: Currency
	/** European Monetary Unit */
	static readonly XBB: Currency
	/** European Unit of Account (XBC) */
	static readonly XBC: Currency
	/** European Unit of Account (XBD) */
	static readonly XBD: Currency
	/** Testing Currency Code */
	static readonly XTS: Currency
	/** Unknown Currency */
	static readonly XXX: Currency
	/** Gold */
	static readonly XAU: Currency
	/** Palladium */
	static readonly XPD: Currency
	/** Platinum */
	static readonly XPT: Currency
	/** Silver */
	static readonly XAG: Currency
	// #endregion
}