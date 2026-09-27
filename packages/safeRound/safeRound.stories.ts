import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { safeRound } from './index.js'

export default {
	title: 'Utilities / Safe Round',
} satisfies Meta

/** Importing the package also installs the function as `Math.safeRound`. */
export const Default: StoryObj = {
	render: () => html`
		<mo-flex gap='4px'>
			<code>safeRound(1.005, 2) = ${safeRound(1.005, 2)}</code>
			<code>Math.safeRound(-2.5) = ${Math.safeRound(-2.5)}</code>
		</mo-flex>
	`,
}

/** Where `Math.round` and `toFixed` trip over binary floating point or round negative halves toward zero, `safeRound` rounds halves away from zero. */
export const Comparison: StoryObj = {
	render: () => html`
		<table style='border-spacing: 16px 4px; font-variant-numeric: tabular-nums; text-align: end'>
			<tr>
				<th>Number</th>
				<th>Math.round</th>
				<th>toFixed</th>
				<th>safeRound</th>
			</tr>
			${[1.005, 2.675, 1.255, -0.125, -1.005].map(number => html`
				<tr>
					<td>${number}</td>
					<td>${Math.round(number * 100) / 100}</td>
					<td>${number.toFixed(2)}</td>
					<td>${safeRound(number, 2)}</td>
				</tr>
			`)}
		</table>
	`,
}