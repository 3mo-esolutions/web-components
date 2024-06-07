import { html, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { popover } from '@3mo/popover'
import type { TooltipPlacement } from './TooltipPlacement.js'

export const tooltip = (content: string | (() => HTMLTemplateResult), placement?: TooltipPlacement) => popover(() => html`
	<mo-tooltip placement=${ifDefined(placement)}>
		${typeof content === 'function' ? content() : content}
	</mo-tooltip>
`)