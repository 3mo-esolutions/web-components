const currencyCodes = ['BTC', 'AFN', 'EUR', 'ALL', 'DZD', 'USD', 'AOA', 'XCD', 'ARS', 'AMD', 'AWG', 'AUD', 'AZN', 'BSD', 'BHD', 'BDT', 'BBD', 'BYN', 'BZD', 'XOF', 'BMD', 'INR', 'BTN', 'BOB', 'BOV', 'BAM', 'BWP', 'NOK', 'BRL', 'BND', 'BGN', 'BIF', 'CVE', 'KHR', 'XAF', 'CAD', 'KYD', 'CLP', 'CLF', 'CNY', 'COP', 'COU', 'KMF', 'CDF', 'NZD', 'CRC', 'CUP', 'CUC', 'ANG', 'CZK', 'DKK', 'DJF', 'DOP', 'EGP', 'SVC', 'ERN', 'SZL', 'ETB', 'FKP', 'FJD', 'XPF', 'GMD', 'GEL', 'GHS', 'GIP', 'GTQ', 'GBP', 'GNF', 'GYD', 'HTG', 'HNL', 'HKD', 'HUF', 'ISK', 'IDR', 'XDR', 'IRR', 'IQD', 'ILS', 'JMD', 'JPY', 'JOD', 'KZT', 'KES', 'KPW', 'KRW', 'KWD', 'KGS', 'LAK', 'LBP', 'LSL', 'ZAR', 'LRD', 'LYD', 'CHF', 'MOP', 'MKD', 'MGA', 'MWK', 'MYR', 'MVR', 'MRU', 'MUR', 'XUA', 'MXN', 'MXV', 'MDL', 'MNT', 'MAD', 'MZN', 'MMK', 'NAD', 'NPR', 'NIO', 'NGN', 'OMR', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PHP', 'PLN', 'QAR', 'RON', 'RUB', 'RWF', 'SHP', 'WST', 'STN', 'SAR', 'RSD', 'SCR', 'SLL', 'SGD', 'XSU', 'SBD', 'SOS', 'SSP', 'LKR', 'SDG', 'SRD', 'SEK', 'CHE', 'CHW', 'SYP', 'SLE', 'TWD', 'TJS', 'TZS', 'THB', 'TOP', 'TTD', 'TND', 'TRY', 'TMT', 'UGX', 'UAH', 'AED', 'USN', 'UYU', 'UYI', 'UYW', 'UZS', 'VUV', 'VES', 'VED', 'VND', 'YER', 'ZMW', 'ZWL', 'XBA', 'XBB', 'XBC', 'XBD', 'XTS', 'XXX', 'XAU', 'XPD', 'XPT', 'XAG'] as const

export type CurrencyCode = typeof currencyCodes[number]

export class Currency {
	static {
		for (const code of currencyCodes) {
			Object.defineProperty(Currency, code, {
				get() { return new Currency(code) }
			})
		}
	}

	constructor(readonly code: CurrencyCode) {
		if (!currencyCodes.includes(code)) {
			throw new Error(`Invalid currency code: ${code}`)
		}
	}

	toString() { return this.code }

	valueOf() { return this.code }

	get symbol() {
		try {
			return Intl.NumberFormat('de-DE', { style: 'currency', currency: this.code, maximumFractionDigits: 0 }).formatToParts(0).find(part => part.type === 'currency')?.value ?? this.code
		} catch {
			return this.code
		}
	}

	// #region Pre-defined currencies
	/** Bitcoin */
	static readonly BTC: Currency
	/** Afghani */
	static readonly AFN: Currency
	/** Euro */
	static readonly EUR: Currency
	/** Lek */
	static readonly ALL: Currency
	/** Algerian Dinar */
	static readonly DZD: Currency
	/** US Dollar */
	static readonly USD: Currency
	/** Kwanza */
	static readonly AOA: Currency
	/** East Caribbean Dollar */
	static readonly XCD: Currency
	/** No universal currency */
	static readonly ARS: Currency
	/** Argentine Peso */
	static readonly AMD: Currency
	/** Armenian Dram */
	static readonly AWG: Currency
	/** Aruban Florin */
	static readonly AUD: Currency
	/** Australian Dollar */
	static readonly AZN: Currency
	/** Azerbaijan Manat */
	static readonly BSD: Currency
	/** Bahamian Dollar */
	static readonly BHD: Currency
	/** Bahraini Dinar */
	static readonly BDT: Currency
	/** Taka */
	static readonly BBD: Currency
	/** Barbados Dollar */
	static readonly BYN: Currency
	/** Belarusian Ruble */
	static readonly BZD: Currency
	/** Belize Dollar */
	static readonly XOF: Currency
	/** CFA Franc BCEAO */
	static readonly BMD: Currency
	/** Bermudian Dollar */
	static readonly INR: Currency
	/** Indian Rupee */
	static readonly BTN: Currency
	/** Ngultrum */
	static readonly BOB: Currency
	/** Boliviano */
	static readonly BOV: Currency
	/** Mvdol */
	static readonly BAM: Currency
	/** Convertible Mark */
	static readonly BWP: Currency
	/** Pula */
	static readonly NOK: Currency
	/** Norwegian Krone */
	static readonly BRL: Currency
	/** Brazilian Real */
	static readonly BND: Currency
	/** Brunei Dollar */
	static readonly BGN: Currency
	/** Bulgarian Lev */
	static readonly BIF: Currency
	/** Burundi Franc */
	static readonly CVE: Currency
	/** Cabo Verde Escudo */
	static readonly KHR: Currency
	/** Riel */
	static readonly XAF: Currency
	/** CFA Franc BEAC */
	static readonly CAD: Currency
	/** Canadian Dollar */
	static readonly KYD: Currency
	/** Cayman Islands Dollar */
	static readonly CLP: Currency
	/** Chilean Peso */
	static readonly CLF: Currency
	/** Unidad de Fomento */
	static readonly CNY: Currency
	/** Yuan Renminbi */
	static readonly COP: Currency
	/** Colombian Peso */
	static readonly COU: Currency
	/** Unidad de Valor Real */
	static readonly KMF: Currency
	/** Comorian Franc */
	static readonly CDF: Currency
	/** Congolese Franc */
	static readonly NZD: Currency
	/** New Zealand Dollar */
	static readonly CRC: Currency
	/** Kuna */
	static readonly CUP: Currency
	/** Cuban Peso */
	static readonly CUC: Currency
	/** Peso Convertible */
	static readonly ANG: Currency
	/** Netherlands Antillean Guilder */
	static readonly CZK: Currency
	/** Czech Koruna */
	static readonly DKK: Currency
	/** Danish Krone */
	static readonly DJF: Currency
	/** Djibouti Franc */
	static readonly DOP: Currency
	/** Dominican Peso */
	static readonly EGP: Currency
	/** Egyptian Pound */
	static readonly SVC: Currency
	/** El Salvador Colon */
	static readonly ERN: Currency
	/** Nakfa */
	static readonly SZL: Currency
	/** Lilangeni */
	static readonly ETB: Currency
	/** Ethiopian Birr */
	static readonly FKP: Currency
	/** Falkland Islands Pound */
	static readonly FJD: Currency
	/** Fiji Dollar */
	static readonly XPF: Currency
	/** CFP Franc */
	static readonly GMD: Currency
	/** Dalasi */
	static readonly GEL: Currency
	/** Lari */
	static readonly GHS: Currency
	/** Ghana Cedi */
	static readonly GIP: Currency
	/** Gibraltar Pound */
	static readonly GTQ: Currency
	/** Quetzal */
	static readonly GBP: Currency
	/** Pound Sterling */
	static readonly GNF: Currency
	/** Guinean Franc */
	static readonly GYD: Currency
	/** Guyana Dollar */
	static readonly HTG: Currency
	/** Gourde */
	static readonly HNL: Currency
	/** Lempira */
	static readonly HKD: Currency
	/** Hong Kong Dollar */
	static readonly HUF: Currency
	/** Forint */
	static readonly ISK: Currency
	/** Iceland Krona */
	static readonly IDR: Currency
	/** Rupiah */
	static readonly XDR: Currency
	/** SDR (Special Drawing Right) */
	static readonly IRR: Currency
	/** Iranian Rial */
	static readonly IQD: Currency
	/** Iraqi Dinar */
	static readonly ILS: Currency
	/** New Israeli Sheqel */
	static readonly JMD: Currency
	/** Jamaican Dollar */
	static readonly JPY: Currency
	/** Yen */
	static readonly JOD: Currency
	/** Jordanian Dinar */
	static readonly KZT: Currency
	/** Tenge */
	static readonly KES: Currency
	/** Kenyan Shilling */
	static readonly KPW: Currency
	/** North Korean Won */
	static readonly KRW: Currency
	/** Won */
	static readonly KWD: Currency
	/** Kuwaiti Dinar */
	static readonly KGS: Currency
	/** Som */
	static readonly LAK: Currency
	/** Lao Kip */
	static readonly LBP: Currency
	/** Lebanese Pound */
	static readonly LSL: Currency
	/** Loti */
	static readonly ZAR: Currency
	/** Rand */
	static readonly LRD: Currency
	/** Liberian Dollar */
	static readonly LYD: Currency
	/** Libyan Dinar */
	static readonly CHF: Currency
	/** Swiss Franc */
	static readonly MOP: Currency
	/** Pataca */
	static readonly MKD: Currency
	/** Denar */
	static readonly MGA: Currency
	/** Malagasy Ariary */
	static readonly MWK: Currency
	/** Malawi Kwacha */
	static readonly MYR: Currency
	/** Malaysian Ringgit */
	static readonly MVR: Currency
	/** Rufiyaa */
	static readonly MRU: Currency
	/** Ouguiya */
	static readonly MUR: Currency
	/** Mauritius Rupee */
	static readonly XUA: Currency
	/** ADB Unit of Account */
	static readonly MXN: Currency
	/** Mexican Peso */
	static readonly MXV: Currency
	/** Mexican Unidad de Inversion (UDI) */
	static readonly MDL: Currency
	/** Moldovan Leu */
	static readonly MNT: Currency
	/** Tugrik */
	static readonly MAD: Currency
	/** Moroccan Dirham */
	static readonly MZN: Currency
	/** Mozambique Metical */
	static readonly MMK: Currency
	/** Kyat */
	static readonly NAD: Currency
	/** Namibia Dollar */
	static readonly NPR: Currency
	/** Nepalese Rupee */
	static readonly NIO: Currency
	/** Cordoba Oro */
	static readonly NGN: Currency
	/** Naira */
	static readonly OMR: Currency
	/** Rial Omani */
	static readonly PKR: Currency
	/** Pakistan Rupee */
	static readonly PAB: Currency
	/** Balboa */
	static readonly PGK: Currency
	/** Kina */
	static readonly PYG: Currency
	/** Guarani */
	static readonly PEN: Currency
	/** Sol */
	static readonly PHP: Currency
	/** Philippine Peso */
	static readonly PLN: Currency
	/** Zloty */
	static readonly QAR: Currency
	/** Qatari Rial */
	static readonly RON: Currency
	/** Romanian Leu */
	static readonly RUB: Currency
	/** Russian Ruble */
	static readonly RWF: Currency
	/** Rwanda Franc */
	static readonly SHP: Currency
	/** Saint Helena Pound */
	static readonly WST: Currency
	/** Tala */
	static readonly STN: Currency
	/** Dobra */
	static readonly SAR: Currency
	/** Saudi Riyal */
	static readonly RSD: Currency
	/** Serbian Dinar */
	static readonly SCR: Currency
	/** Seychelles Rupee */
	static readonly SLL: Currency
	/** Leone */
	static readonly SGD: Currency
	/** Singapore Dollar */
	static readonly XSU: Currency
	/** Sucre */
	static readonly SBD: Currency
	/** Solomon Islands Dollar */
	static readonly SOS: Currency
	/** Somali Shilling */
	static readonly SSP: Currency
	/** South Sudanese Pound */
	static readonly LKR: Currency
	/** Sri Lanka Rupee */
	static readonly SDG: Currency
	/** Sudanese Pound */
	static readonly SRD: Currency
	/** Surinam Dollar */
	static readonly SEK: Currency
	/** Swedish Krona */
	static readonly CHE: Currency
	/** WIR Euro */
	static readonly CHW: Currency
	/** WIR Franc */
	static readonly SYP: Currency
	/** Sierra Leonean leone */
	static readonly SLE: Currency
	/** Syrian Pound */
	static readonly TWD: Currency
	/** New Taiwan Dollar */
	static readonly TJS: Currency
	/** Somoni */
	static readonly TZS: Currency
	/** Tanzanian Shilling */
	static readonly THB: Currency
	/** Baht */
	static readonly TOP: Currency
	/** Pa’anga */
	static readonly TTD: Currency
	/** Trinidad and Tobago Dollar */
	static readonly TND: Currency
	/** Tunisian Dinar */
	static readonly TRY: Currency
	/** Turkish Lira */
	static readonly TMT: Currency
	/** Turkmenistan New Manat */
	static readonly UGX: Currency
	/** Uganda Shilling */
	static readonly UAH: Currency
	/** Hryvnia */
	static readonly AED: Currency
	/** UAE Dirham */
	static readonly USN: Currency
	/** US Dollar (Next day) */
	static readonly UYU: Currency
	/** Peso Uruguayo */
	static readonly UYI: Currency
	/** Uruguay Peso en Unidades Indexadas (UI) */
	static readonly UYW: Currency
	/** Unidad Previsional */
	static readonly UZS: Currency
	/** Uzbekistan Sum */
	static readonly VUV: Currency
	/** Vatu */
	static readonly VES: Currency
	/** Bolívar Soberano */
	static readonly VED: Currency
	/** Dong */
	static readonly VND: Currency
	/** Yemeni Rial */
	static readonly YER: Currency
	/** Zambian Kwacha */
	static readonly ZMW: Currency
	/** Zimbabwe Dollar */
	static readonly ZWL: Currency
	/** Bond Markets Unit European Composite Unit (EURCO) */
	static readonly XBA: Currency
	/** Bond Markets Unit European Monetary Unit (E.M.U.-6) */
	static readonly XBB: Currency
	/** Bond Markets Unit European Unit of Account 9 (E.U.A.-9) */
	static readonly XBC: Currency
	/** Bond Markets Unit European Unit of Account 17 (E.U.A.-17) */
	static readonly XBD: Currency
	/** Codes specifically reserved for testing purposes */
	static readonly XTS: Currency
	/** The codes assigned for transactions where no currency is involved */
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