import { css } from '@a11d/lit'

/** The styling a field gives to a group of date-time segments. */
export const segmentsStyles = css`
	[part=segments], [part=segments-range] {
		white-space: nowrap;
		cursor: text;
		/* What a browser gives the <input> of the other fields, which never set either themselves. */
		font-size: 13.333px;
		line-height: normal;
		font-variant-numeric: tabular-nums;
	}

	[part=segments] {
		display: inline;
	}

	[part=segment], [part=literal] {
		display: inline;
	}

	[part=segment] {
		border-radius: 2px;
		padding-inline: 1px;
		outline: none;
		caret-color: transparent;
		user-select: none;

		&:focus {
			background: var(--mo-color-selected);
			color: var(--mo-color-on-selected);
		}

		&[data-placeholder] {
			color: transparent;
		}
	}

	[part=literal] {
		color: transparent;
	}

	mo-field[active] :is([part=segment][data-placeholder], [part=literal]),
	mo-field[populated] :is([part=segment][data-placeholder], [part=literal]) {
		color: var(--mo-color-gray);
	}
`