import { Directive, directive, noChange, PartType, type ElementPart, type Part } from '@a11d/lit'
import { description, label } from '@a11d/metadata'
import { DataGridColumnComponent } from './columns/DataGridColumnComponent.js'

type BoundColumnProperty = 'dataSelector' | 'heading' | 'description'

class BindDataGridColumnDirective extends Directive {
	private readonly appliedValues = new Map<BoundColumnProperty, string | undefined>()

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	render(_type: Constructor<unknown>, _keyPath: string) {
		return noChange
	}

	override update(part: Part, [type, keyPath]: Parameters<this['render']>) {
		const column = part.type !== PartType.ELEMENT ? undefined : (part as ElementPart).element
		if (column instanceof DataGridColumnComponent === false) {
			throw new Error('DataGridColumnBinder can only bind DataGridColumnComponent elements')
		}

		const shortLabel = label.short.getByKeyPath(type, keyPath)
		const fullLabel = label.getByKeyPath(type, keyPath)
		const fullDescription = description.getByKeyPath(type, keyPath)

		this.apply(column, 'dataSelector', keyPath)
		this.apply(column, 'heading', shortLabel || fullLabel)
		this.apply(column, 'description', shortLabel ? fullLabel || fullDescription : fullDescription)

		return noChange
	}

	/** Applied on every render so that a changed key path propagates, but never over a value the column was configured with explicitly. */
	private apply(column: DataGridColumnComponent<unknown, unknown>, property: BoundColumnProperty, value: string | undefined) {
		const properties = column as Record<BoundColumnProperty, string | undefined>
		if (!properties[property] || properties[property] === this.appliedValues.get(property)) {
			properties[property] = value
			this.appliedValues.set(property, value)
		}
	}
}

const bindDataGridColumn = directive(BindDataGridColumnDirective)

/**
 * Binds columns to the members of a type: the key path becomes the data selector, the `label` the heading
 * and the `description` the description. A `label.short` becomes the heading instead, with the label moving into the description.
 *
 * @example
 * ```ts
 * const { bind } = DataGridColumnBinder.for(Order)
 * html`<mo-data-grid-column-currency ${bind('totalAmount')}></mo-data-grid-column-currency>`
 * ```
 */
export class DataGridColumnBinder {
	static for<T>(type: Constructor<T>) {
		return {
			bind: (keyPath: KeyPath.Of<T>) => bindDataGridColumn(type, keyPath),
		}
	}
}
