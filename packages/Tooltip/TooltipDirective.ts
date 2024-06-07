import { html, ifDefined } from '@a11d/lit'
import { popover } from '@3mo/popover'
import type { TooltipPlacement } from './TooltipPlacement.js'

export const tooltip = (content: string, placement?: TooltipPlacement) => popover(() => html`
	<mo-tooltip placement=${ifDefined(placement)}>
		${content}
	</mo-tooltip>
`)