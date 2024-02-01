import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { dependsOnScreenSize, hideOnScreenSize } from './index.js'

export default meta({
	title: 'Depends On Screen Size',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

export const DependsOnScreenSize = story({
	render: () => html`
		<mo-flex>
			${dependsOnScreenSize({ mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' })}
		</mo-flex>
	`
})

export const HideOnScreenSize = story({
	render: () => html`
		<mo-flex gap='10px'>
			<div style='color: black; padding: 10px; background-color: gray'>Don't hide</div>
			<div style='color: black; padding: 10px; background-color: lightcoral' ${hideOnScreenSize('mobile')}>Hide on mobile</div>
			<div style='color: black; padding: 10px; background-color: lightblue' ${hideOnScreenSize('tablet')}>Hide on tablet</div>
			<div style='color: black; padding: 10px; background-color: lightgreen' ${hideOnScreenSize('desktop')}>Hide on desktop</div>
			<div style='color: black; padding: 10px; background-color: lightcoral' ${hideOnScreenSize('mobile', 'tablet')}>Hide on mobile and tablet</div>
			<div style='color: black; padding: 10px; background-color: lightcoral' ${hideOnScreenSize('tablet', 'desktop')}>Hide on tablet and desktop</div>
			<div style='color: black; padding: 10px; background-color: lightcoral' ${hideOnScreenSize('mobile', 'desktop')}>Hide on mobile and desktop</div>
		</mo-flex>
	`
})