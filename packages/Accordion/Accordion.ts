import { Component, component, css, event, eventListener, html, property } from '@a11d/lit'
import { AccordionItem } from './AccordionItem.js'

/** Which item of an accordion is open — or which of them are, while it holds several. */
export type AccordionValue = string | Array<string> | undefined

/**
 * A stack of disclosures of which only one is open at a time, unless several are allowed to be.
 *
 * Each item brings its own "details" element and therefore its own semantics and animation — see
 * {@link AccordionItem}. What the accordion adds is the part a group of "details" elements cannot express
 * itself: they are only mutually exclusive when they share a tree, which items in their own shadow roots
 * never do. It follows their "openChange" and closes the others, and projects which of them is open onto
 * "value", so that the open item can be read, written and bound to like any other value in this library.
 *
 * @element mo-accordion
 *
 * @attr multiple - Whether several items may be open at the same time.
 * @attr value - The "value" of the open item, or an array of them while "multiple" is set.
 *
 * @slot - The items of the accordion.
 *
 * @fires change - Dispatched with the new value whenever the accordion arrives at one itself, as the platform has it for every control which is a choice.
 */
@component('mo-accordion')
export class Accordion extends Component {
	@event() readonly change!: EventDispatcher<AccordionValue>

	@property({
		bindingDefault: true,
		event: 'change',
		updated(this: Accordion) {
			this.applyValue()
		}
	}) value?: AccordionValue

	// Declared after "value", so that a value handed over in the same update is what this re-reads.
	@property({
		type: Boolean,
		reflect: true,
		updated(this: Accordion, _: boolean, previousMultiple: boolean | undefined) {
			if (previousMultiple !== undefined) {
				this.enforceExclusivity()
				this.commitValue()
			}
		}
	}) multiple = false

	get items() {
		return [...this.children].filter((child): child is AccordionItem => child instanceof AccordionItem)
	}

	get openItems() {
		return this.items.filter(item => item.open)
	}

	static override get styles() {
		return css`
			:host {
				display: grid;
				align-content: start;
			}

			::slotted(mo-accordion-item:not(:last-of-type)) {
				border-block-end: 1px solid var(--mo-color-transparent-gray-3);
			}
		`
	}

	protected override get template() {
		return html`<slot @slotchange=${this.handleSlotChange}></slot>`
	}

	@eventListener('openChange')
	protected handleItemOpenChange(event: CustomEvent<boolean>) {
		// An accordion nested in an item of another one has its own items to look after.
		const item = this.items.find(item => item === event.target)
		if (item) {
			if (item.open) {
				this.enforceExclusivity(item)
			}
			this.commitValue()
		}
	}

	private readonly handleSlotChange = () => {
		if (this.value === undefined) {
			// Adopting what the items declare is not a change any consumer made and therefore not worth an event.
			this.enforceExclusivity()
			this.value = this.derivedValue
		} else {
			this.applyValue()
		}
	}

	/** Leaves the given item as it is and closes every other one, unless several may be open. */
	private enforceExclusivity(openItem = this.openItems[0]) {
		if (this.multiple === false) {
			this.items.forEach(item => item.open = item === openItem)
		}
	}

	private applyValue() {
		const values = this.valueArray
		this.namedItems.forEach(item => item.open = values.includes(item.value))
	}

	/** Takes over what the items are up to, which every one of them opening or closing runs through. */
	private commitValue() {
		const value = this.derivedValue
		if (Accordion.valuesEqual(value, this.value) === false) {
			this.value = value
			this.change.dispatch(value)
		}
	}

	/** The items a value can name. The rest take part in the accordion, but not in its value. */
	private get namedItems() {
		return this.items.filter((item): item is AccordionItem & { value: string } => item.value !== undefined)
	}

	private get valueArray() {
		return this.value === undefined ? [] : [this.value].flat()
	}

	private get derivedValue(): AccordionValue {
		const values = this.namedItems.filter(item => item.open).map(item => item.value)
		return this.multiple ? values : values[0]
	}

	private static valuesEqual(value: AccordionValue, otherValue: AccordionValue) {
		return value instanceof Array && otherValue instanceof Array
			? value.length === otherValue.length && value.every((v, index) => v === otherValue[index])
			: value === otherValue
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-accordion': Accordion
	}
}