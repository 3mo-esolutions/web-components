import { type HTMLTemplateResult, property } from '@a11d/lit'
import { DataGridColumnComponent } from '../DataGridColumnComponent.js'
import { DataGridColumn, type DataGridColumnAlignment } from '../../DataGridColumn.js'

export abstract class DataGridColumnNumberBase<TData> extends DataGridColumnComponent<TData, number> {
	@property() sumHeading: string | undefined = undefined
	@property() override textAlign: DataGridColumnAlignment = 'end'

	@property({ type: Number }) min?: number
	@property() minDataSelector?: KeyPath.Of<TData>
	protected getMin(data: TData) { return this.min ?? (this.minDataSelector ? KeyPath.get(data, this.minDataSelector) as number : undefined) }

	@property({ type: Number }) max?: number
	@property() maxDataSelector?: KeyPath.Of<TData>
	protected getMax(data: TData) { return this.max ?? (this.maxDataSelector ? KeyPath.get(data, this.maxDataSelector) as number : undefined) }

	@property({ type: Number }) step?: number
	@property() stepDataSelector?: KeyPath.Of<TData>
	protected getStep(data: TData) { return this.step ?? (this.stepDataSelector ? KeyPath.get(data, this.stepDataSelector) as number : undefined) }

	override get column() {
		return new DataGridColumn<TData, number>({
			...super.column,
			sumHeading: this.sumHeading,
			getSumTemplate: this.getSumTemplate.bind(this),
		})
	}

	protected getNumber(value: number | undefined) {
		return Number.isFinite(value) ? value : undefined
	}

	abstract getSumTemplate(sum: number): HTMLTemplateResult
}