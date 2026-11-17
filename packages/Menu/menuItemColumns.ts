import { css } from '@a11d/lit'

/** Places a menu item's start, content and end on three columns, which a `mo-menu` shares among all its items. */
export const menuItemColumns = css`
	:host {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0;
	}

	slot:is([name=start], :not([name]), [name=end]) {
		display: flex;
		align-items: center;
		grid-row: 1;
	}

	slot[name=start] {
		grid-column: 1;
	}

	slot:not([name]) {
		grid-column: 2;
		gap: 1rem;
	}

	slot[name=end] {
		grid-column: 3;
		justify-content: end;
	}

	slot[name=start]::slotted(*), slot[name=start] > * {
		margin-inline-end: 1rem;
	}

	slot[name=end]::slotted(*), slot[name=end] > * {
		margin-inline-start: 1rem;
	}
`
