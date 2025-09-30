// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

import configs from '@a11d/eslint-config/eslint.config.mjs'

export default [...configs, {
	ignores: ['dist', 'test-temp']
}, ...storybook.configs['flat/recommended']]