import configs from '@a11d/eslint-config/eslint.config.mjs'

export default [...configs, {
	ignores: ['dist', 'test-temp']
}]