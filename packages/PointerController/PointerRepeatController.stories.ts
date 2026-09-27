import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from '@a11d/lit'
import { useState } from 'storybook/preview-api'
import type { PointerRepeatController } from '@3mo/pointer-controller'
import { sourceOf } from '../../.storybook/source.js'
import repeatButtonSource from './stories/RepeatButton.ts?raw'
import './stories/RepeatButton.js'

export default {
	title: 'Behaviors / Pointer Repeat Controller',
	parameters: sourceOf(repeatButtonSource),
	decorators: [story => html`<div style='display: flex; flex-direction: column; gap: 16px'>${story()}</div>`],
} satisfies Meta

/** Hold + down: after 500ms it keeps stepping. Tab to it and hold Enter, and the keyboard repeats the same way. */
export const Default: StoryObj = {
	render: () => {
		const [value, setValue] = useState(0)
		return html`
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat @trigger=${() => setValue(value => value - 1)}>−</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${value}</output>
				<story-repeat-button repeat @trigger=${() => setValue(value => value + 1)}>+</story-repeat-button>
			</div>
		`
	},
}

/** Ignoring the repetitions, a held pointer steps once - while a held Enter still repeats. That asymmetry is what the controller closes. */
export const PressOnly: StoryObj = {
	render: () => {
		const [value, setValue] = useState(0)
		return html`
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button @trigger=${() => setValue(value => value - 1)}>−</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${value}</output>
				<story-repeat-button @trigger=${() => setValue(value => value + 1)}>+</story-repeat-button>
			</div>
		`
	},
}

/** The trigger receives the number of triggers before it, so a long hold can widen the step from 1 to 10 to 100 - the policy is the consumer's. */
export const Acceleration: StoryObj = {
	render: () => {
		const [value, setValue] = useState(0)
		const step = (direction: number) => (event: CustomEvent<number>) => {
			const repetition = event.detail
			setValue(value => value + direction * (repetition < 15 ? 1 : repetition < 35 ? 10 : 100))
		}
		return html`
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat @trigger=${step(-1)}>−</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${value}</output>
				<story-repeat-button repeat @trigger=${step(1)}>+</story-repeat-button>
			</div>
		`
	},
}

/** Hold + past 10: `stop()` ends the repetition at the bound while the press is still down, so nothing keeps firing into the clamp. */
export const StoppingAtABound: StoryObj = {
	render: () => {
		const [value, setValue] = useState(0)
		const step = (direction: number) => (event: CustomEvent<number>) => {
			const button = event.currentTarget as HTMLElement & { readonly repeatController: PointerRepeatController }
			setValue(value => {
				const next = Math.min(10, Math.max(0, value + direction))
				if (next === 0 || next === 10) {
					button.repeatController.stop()
				}
				return next
			})
		}
		return html`
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat @trigger=${step(-1)}>−</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${value}</output>
				<story-repeat-button repeat @trigger=${step(1)}>+</story-repeat-button>
			</div>
		`
	},
}

/** `delay` and `interval` are options, so a coarse control can be deliberate and a fine one brisk. */
export const Timing: StoryObj = {
	render: () => {
		const [values, setValues] = useState([0, 0, 0])
		const increment = (index: number) => () => setValues(values => values.map((value, i) => i === index ? value + 1 : value))
		return html`
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat @trigger=${increment(0)}>+</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${values[0]}</output>
				<small>500ms, then every 50ms</small>
			</div>
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat delay='1000' interval='250' @trigger=${increment(1)}>+</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${values[1]}</output>
				<small>1000ms, then every 250ms</small>
			</div>
			<div style='display: flex; align-items: center; gap: 8px'>
				<story-repeat-button repeat delay='250' interval='16' @trigger=${increment(2)}>+</story-repeat-button>
				<output style='min-width: 4rem; text-align: end'>${values[2]}</output>
				<small>250ms, then every 16ms</small>
			</div>
		`
	},
}