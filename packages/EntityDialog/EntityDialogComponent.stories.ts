import { story, meta } from '../../.storybook/story.js'
import { html } from '@a11d/lit'
import p from './package.json'
import './index.js'
import { EntityDialogComponent } from './index.js'
import { EntityId } from 'packages/FetchableDialog/FetchableDialogComponent.js'

export default meta({
	title: 'EntityDialog',
	component: 'mo-entity-dialog',
	parameters: {
		docs: {
			description: {
				component: p.description,
			},
		}
	}
})

type Data = {
	id: number
	name: string
}

class DialogData extends EntityDialogComponent<Data> {
	protected override entity = { id: 1, name: 'Test' }
	protected override fetch = (id: EntityId) => new Promise<Data>(resolve => setTimeout(() => resolve({ id: Number(id), name: 'Test' }), 2000))
	protected override save = (entity: Data) => new Promise<Data>(resolve => setTimeout(() => resolve(entity), 2000))
	protected override delete = () => new Promise<void>(resolve => setTimeout(() => resolve(), 2000))

	protected override get template() {
		return html`
			<mo-entity-dialog heading='Data'>
				<mo-field-number disabled label='Id' .value=${this.entity.id}></mo-field-number>
				<mo-field-text label='Name' .value=${this.entity.name}></mo-field-text>
			</mo-entity-dialog>
		`
	}
}

customElements.define('mo-test-dialog-data', DialogData)

export const DialogComponent = story({
	render: () => html`
		<mo-button @click=${() => new DialogData({ id: 1 }).confirm()}>Open</mo-button>
	`,
})