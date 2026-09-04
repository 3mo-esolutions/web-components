import { html, ifDefined, type HTMLTemplateResult } from '@a11d/lit'
import { popover } from '@3mo/popover'
import type { TooltipPlacement } from './TooltipPlacement.js'

export const tooltip = (content: string | (() => HTMLTemplateResult), placement?: TooltipPlacement) => popover(() => html`
	<mo-tooltip placement=${ifDefined(placement)}>
		${typeof content === 'function' ? content() : content}
	</mo-tooltip>
`, {
	trigger: 'interest',
	// Textual content names the anchor right away, i.e. without materializing the tooltip first.
	// It is coerced rather than checked for being a primitive string, as localized strings are
	// objects which stringify to their localization.
	label: typeof content === 'function' ? undefined : String(content),
})