import { Commit } from './Commit.js'
import { Change } from './Change.js'
import { Trailer } from './Trailer.js'

describe('Commit', () => {
	it('should parse non-conventional changes', () => {
		expect(Commit.parse(`
commit c2b80b96119829801c5b0de375f8155f46389c4c
Author: a11delavar <a11delavar@outlook.com>
Date:   Wed Apr 3 21:07:48 2024 +0200

    New feature

    This new feature is awesome
	`)).toEqual(new Commit({
			hash: 'c2b80b96119829801c5b0de375f8155f46389c4c',
			date: new Date('2024-04-03T19:07:48.000Z'),
			author: { name: 'a11delavar', email: 'a11delavar@outlook.com' },
			changes: [
				new Change({ heading: 'New feature', description: 'This new feature is awesome', isBreaking: false }),
			],
		}))
	})

	it('should parse trailers', () => {
		expect(Commit.parse(`
commit c2b80b96119829801c5b0de375f8155f46389c4c
Author: a11delavar <a11delavar@outlook.com>
Date:   Wed Apr 3 21:07:48 2024 +0200

    New feature

    This new feature is awesome

    Signed-off-by: a11delavar <a11delavar@outlook.com>
    Co-authored-by: Someone <someone@example.com>
	`)).toEqual(new Commit({
			hash: 'c2b80b96119829801c5b0de375f8155f46389c4c',
			date: new Date('2024-04-03T19:07:48.000Z'),
			author: { name: 'a11delavar', email: 'a11delavar@outlook.com' },
			changes: [
				new Change({ heading: 'New feature', description: 'This new feature is awesome', isBreaking: false }),
			],
			trailers: [
				new Trailer({ key: 'Signed-off-by', value: 'a11delavar <a11delavar@outlook.com>' }),
				new Trailer({ key: 'Co-authored-by', value: 'Someone <someone@example.com>' }),
			],
		}))
	})

	it('should parse multiple conventional changes', () => {
		expect(Commit.parse(`
commit c2b80b96119829801c5b0de375f8155f46389c4c
Author: a11delavar <a11delavar@outlook.com>
Date:   Wed Apr 3 21:07:48 2024 +0200

    feat(scope1)!: New feature

    This new feature is awesome

    fix(scope2): Bug fix
    chore: Some chore
     - Refactor the code leading to prepare for the next feature
     - Notice that this is a multiline description

    Co-Authored-by: someone
	`)).toEqual(new Commit({
			hash: 'c2b80b96119829801c5b0de375f8155f46389c4c',
			date: new Date('2024-04-03T19:07:48.000Z'),
			author: { name: 'a11delavar', email: 'a11delavar@outlook.com' },
			changes: [
				new Change({
					type: 'feat',
					scope: 'scope1',
					heading: 'New feature',
					description: 'This new feature is awesome',
					isBreaking: true,
				}),
				new Change({
					type: 'fix',
					scope: 'scope2',
					heading: 'Bug fix',
					description: undefined,
					isBreaking: false,
				}),
				new Change({
					type: 'chore',
					scope: undefined,
					heading: 'Some chore',
					description: '- Refactor the code leading to prepare for the next feature\n- Notice that this is a multiline description',
					isBreaking: false,
				}),
			],
			trailers: [
				new Trailer({ key: 'Co-Authored-by', value: 'someone' }),
			],
		}))
	})
})