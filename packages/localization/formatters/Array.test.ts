import './Array.format.js'

describe('Array', () => {
	const array = [2, 'foo', null, 'bar', new Date, 'baz', undefined]

	it('.format()', () => {
		expect(array.format('de')).toEqual('foo, bar und baz')
		expect(array.format({ language: 'de' })).toEqual('foo, bar und baz')

		expect(array.format('en')).toEqual('foo, bar, and baz')
		expect(array.format({ language: 'en' })).toEqual('foo, bar, and baz')

		expect(array.format('fa')).toEqual('foo،‏ bar، و baz')
		expect(array.format({ language: 'fa' })).toEqual('foo،‏ bar، و baz')
	})

	it('.formatToParts()', () => {
		expect(array.formatToParts('de')).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: ', ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: ' und ' },
			{ type: 'element', value: 'baz' },
		])
		expect(array.formatToParts({ language: 'de' })).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: ', ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: ' und ' },
			{ type: 'element', value: 'baz' },
		])

		expect(array.formatToParts('en')).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: ', ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: ', and ' },
			{ type: 'element', value: 'baz' },
		])
		expect(array.formatToParts({ language: 'en' })).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: ', ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: ', and ' },
			{ type: 'element', value: 'baz' },
		])

		expect(array.formatToParts('fa')).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: '،‏ ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: '، و ' },
			{ type: 'element', value: 'baz' },
		])
		expect(array.formatToParts({ language: 'fa' })).toEqual([
			{ type: 'element', value: 'foo' },
			{ type: 'literal', value: '،‏ ' },
			{ type: 'element', value: 'bar' },
			{ type: 'literal', value: '، و ' },
			{ type: 'element', value: 'baz' },
		])
	})

	it('.formatAsConjunction()', () => {
		expect(array.formatAsConjunction('de')).toEqual('foo, bar und baz')
		expect(array.formatAsConjunction({ language: 'de' })).toEqual('foo, bar und baz')

		expect(array.formatAsConjunction('en')).toEqual('foo, bar, and baz')
		expect(array.formatAsConjunction('en', { style: 'short' })).toEqual('foo, bar, & baz')
		expect(array.formatAsConjunction('en', { style: 'narrow' })).toEqual('foo, bar, baz')
		expect(array.formatAsConjunction({ language: 'en' })).toEqual('foo, bar, and baz')

		expect(array.formatAsConjunction('fa')).toEqual('foo،‏ bar، و baz')
		expect(array.formatAsConjunction('fa', { style: 'narrow' })).toEqual('foo،‏ bar،‏ baz')
		expect(array.formatAsConjunction({ language: 'fa' })).toEqual('foo،‏ bar، و baz')
	})

	it('.formatAsDisjunction()', () => {
		expect(array.formatAsDisjunction('de')).toEqual('foo, bar oder baz')
		expect(array.formatAsDisjunction({ language: 'de' })).toEqual('foo, bar oder baz')

		expect(array.formatAsDisjunction('en')).toEqual('foo, bar, or baz')
		expect(array.formatAsDisjunction({ language: 'en' })).toEqual('foo, bar, or baz')

		expect(array.formatAsDisjunction('fa')).toEqual('foo،‏ bar، یا baz')
		expect(array.formatAsDisjunction({ language: 'fa' })).toEqual('foo،‏ bar، یا baz')
	})

	it('.formatAsUnit()', () => {
		expect(array.formatAsUnit('de')).toEqual('foo, bar und baz')
		expect(array.formatAsUnit({ language: 'de' })).toEqual('foo, bar und baz')

		expect(array.formatAsUnit('en')).toEqual('foo, bar, baz')
		expect(array.formatAsUnit('en', { style: 'narrow' })).toEqual('foo bar baz')
		expect(array.formatAsUnit({ language: 'en' })).toEqual('foo, bar, baz')

		expect(array.formatAsUnit('fa')).toEqual('foo،‏ bar، و baz')
		expect(array.formatAsUnit({ language: 'fa' })).toEqual('foo،‏ bar، و baz')
	})
})