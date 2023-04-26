import { LanguageCode } from '../LanguageCode.js'

describe('DateTime', () => {
	const date = new Date('2020-01-01T00:00:00.000Z')

	it('.format()', () => {
		expect(date.format({ language: LanguageCode.German })).toEqual('01.01.2020, 01:00:00 GMT+1')
	})

	it('.formatAsTime()', () => {
		expect(date.formatAsTime({ language: LanguageCode.German })).toEqual('01:00:00 GMT+1')
	})

	it('.formatAsDate()', () => {
		expect(date.formatAsDate({ language: LanguageCode.German })).toEqual('01.01.2020')
	})
})