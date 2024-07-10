import { Change } from './Change.js'

describe('Change', () => {
	it('should parse non-conventional changes', () => {
		expect(Change.parse('This is a non-conventional change')).toEqual(new Change({
			heading: 'This is a non-conventional change',
			description: undefined,
			isBreaking: false,
		}))
	})

	it('should parse non-conventional changes with description', () => {
		expect(Change.parse('This is a non-conventional change\n\n\nIt is very important!   \n  You can activate it in the settings')).toEqual(new Change({
			heading: 'This is a non-conventional change',
			description: 'It is very important!\nYou can activate it in the settings',
			isBreaking: false,
		}))
	})

	it('should parse non-conventional changes with references', () => {
		expect(Change.parse('This is a non-conventional change (#123)')).toEqual(new Change({
			heading: 'This is a non-conventional change (#123)',
			description: undefined,
			isBreaking: false,
			references: ['#123']
		}))

		expect(Change.parse('This is a non-conventional change (#123) \n\nFixed #456')).toEqual(new Change({
			heading: 'This is a non-conventional change (#123)',
			description: 'Fixed #456',
			isBreaking: false,
			references: ['#123', '#456']
		}))
	})

	it('should parse conventional changes', () => {
		expect(Change.parse('feat: This is a conventional change')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a conventional change',
			description: undefined,
			isBreaking: false
		}))
	})

	it('should parse conventional changes with scope', () => {
		expect(Change.parse('fix(scope): This is a conventional change')).toEqual(new Change({
			type: 'fix',
			scope: 'scope',
			heading: 'This is a conventional change',
			description: undefined,
			isBreaking: false
		}))
	})

	it('should parse conventional changes with breaking change marker', () => {
		expect(Change.parse('feat!: This is a breaking change')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a breaking change',
			description: undefined,
			isBreaking: true
		}))
	})

	it('should parse conventional changes with scope and breaking change marker', () => {
		expect(Change.parse('feat(scope)!: This is a breaking change')).toEqual(new Change({
			type: 'feat',
			scope: 'scope',
			heading: 'This is a breaking change',
			description: undefined,
			isBreaking: true
		}))
	})

	it('should parse GitHub-like issue/PR references', () => {
		expect(Change.parse('feat: This is a conventional change (#123)')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a conventional change (#123)',
			description: undefined,
			isBreaking: false,
			references: ['#123']
		}))

		expect(Change.parse('feat: This is a conventional change (#123) Fixed #456')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a conventional change (#123) Fixed #456',
			description: undefined,
			isBreaking: false,
			references: ['#123', '#456']
		}))
	})

	it('should parse JIRA-like ticket references', () => {
		expect(Change.parse('feat: This is a conventional change (ABC-123)')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a conventional change (ABC-123)',
			description: undefined,
			isBreaking: false,
			references: ['ABC-123']
		}))

		expect(Change.parse('feat: DEV-1234: This is a conventional change (Regression introduced by ABC-123)')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'DEV-1234: This is a conventional change (Regression introduced by ABC-123)',
			description: undefined,
			isBreaking: false,
			references: ['DEV-1234', 'ABC-123']
		}))
	})

	it('should parse heading and description', () => {
		expect(Change.parse('feat: This is a conventional change\n\n\nThis feature can do magic!\nYou can enable it in settings.\n')).toEqual(new Change({
			type: 'feat',
			scope: undefined,
			heading: 'This is a conventional change',
			description: 'This feature can do magic!\nYou can enable it in settings.',
			isBreaking: false
		}))
	})
})