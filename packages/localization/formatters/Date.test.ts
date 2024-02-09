describe('Date', () => {
	const date = new Date('2020-01-01T00:00:00.000Z')

	it('.format()', () => {
		expect(date.format('de')).toEqual('01.01.2020, 00:00:00 GMT')
		expect(date.format({ language: 'de' })).toEqual('01.01.2020, 00:00:00 GMT')
	})

	it('.formatToParts()', () => {
		const a = date.formatToParts({ language: 'de' })
		const b = date.formatToParts('de')
		for (const i of [a, b]) {
			expect(i).toEqual(
				[
					{ type: 'day', value: '01' },
					{ type: 'literal', value: '.' },
					{ type: 'month', value: '01' },
					{ type: 'literal', value: '.' },
					{ type: 'year', value: '2020' },
					{ type: 'literal', value: ', ' },
					{ type: 'hour', value: '00' },
					{ type: 'literal', value: ':' },
					{ type: 'minute', value: '00' },
					{ type: 'literal', value: ':' },
					{ type: 'second', value: '00' },
					{ type: 'literal', value: ' ' },
					{ type: 'timeZoneName', value: 'GMT' },
				]
			)
		}
	})

	it('.formatAsTime()', () => {
		expect(date.formatAsTime('de')).toEqual('00:00:00 GMT')
		expect(date.formatAsTime({ language: 'de' })).toEqual('00:00:00 GMT')
	})

	it('.formatAsDate()', () => {
		expect(date.formatAsDate('de')).toEqual('01.01.2020')
		expect(date.formatAsDate({ language: 'de' })).toEqual('01.01.2020')
	})
})