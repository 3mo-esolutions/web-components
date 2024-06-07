import { html, type HTMLTemplateResult } from '@a11d/lit'
import { popover } from '@3mo/popover'

export const contextMenu = (content: () => HTMLTemplateResult) => popover(() => html`
	<mo-context-menu>
		${content()}
	</mo-context-menu>
`)