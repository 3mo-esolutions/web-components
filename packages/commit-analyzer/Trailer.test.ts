import { Trailer } from './Trailer.js'

describe('Trailer', () => {
	// The keys are a shared static registry, so a test which extends them has to hand them back.
	const builtInKeys = [...Trailer.keys]
	afterEach(() => Trailer.keys.splice(0, Trailer.keys.length, ...builtInKeys))

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

	it('should return undefined for a line without a key-value shape', () => {
		expect(Trailer.parse('')).toBeUndefined()
		expect(Trailer.parse('This is a plain sentence without a trailer')).toBeUndefined()
		expect(Trailer.parse('Signed-off-by:no-space-after-the-colon')).toBeUndefined()
	})
})