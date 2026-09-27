import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import { KeyboardController } from './index.js'

export default {
	title: 'Utilities / Keyboard Controller',
} satisfies Meta

/** Hold Ctrl, Shift, Alt or Meta and click: the handler reads the keys without an event of its own. A key only counts if it went down while the page had focus. */
export const Default: StoryObj = {
	render: () => {
		const [modifiers, setModifiers] = useState('')
		return html`
			<mo-flex direction='horizontal' gap='16px' alignItems='center'>
				<mo-button type='outlined' @click=${() => setModifiers([
					KeyboardController.ctrl && 'Ctrl',
					KeyboardController.shift && 'Shift',
					KeyboardController.alt && 'Alt',
					KeyboardController.meta && 'Meta',
				].filter(Boolean).join(' + ') || 'None')}>Click</mo-button>
				<span>${modifiers}</span>
			</mo-flex>
		`
	},
}