import { Trailer } from './Trailer.js'

describe('Trailer', () => {
	it('should parse with build-in keys', () => {
		expect(Trailer.parse('Co-authored-by: Someone <someone@example.com>')).toEqual(new Trailer({
			key: 'Co-authored-by',
			value: 'Someone <someone@example.com>',
		}))

		expect(Trailer.parse('Signed-off-by: a11delavar <a11delavar@outlook.com>')).toEqual(new Trailer({
			key: 'Signed-off-by',
			value: 'a11delavar <a11delavar@outlook.com>',
		}))
	})

	it('should not parse unknown keys unless added to keys', () => {
		expect(Trailer.parse('Permission: permission1, permission2')).toBeUndefined()
		Trailer.keys.push('permission')
		expect(Trailer.parse('Permission: permission1, permission2')).toEqual(new Trailer({
			key: 'Permission',
			value: 'permission1, permission2',
		}))
	})
})