import { Popover } from '@3mo/popover'

/**
 * A floating-ui middleware that ensures the popover has the same inline size as the anchor element.
 */
export function sameInlineSize(): import('@floating-ui/dom').Middleware {
	return {
		name: 'sameInlineSize',
		fn(state) {
			const popover = state.elements.floating
			if (popover instanceof Popover === false) {
				return {}
			}
			popover.style.minWidth = `${state.rects.reference.width}px`
			return {}
		}
	}
}