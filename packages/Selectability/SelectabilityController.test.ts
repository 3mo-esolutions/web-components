import { component, Component, css, html, ifDefined } from '@a11d/lit'
import { ComponentTestFixture } from '@a11d/lit-testing'
import { IndexabilityController } from '@3mo/indexability'
import { Selectability, SelectabilityBehaviorOnItemsChange, SelectabilityController, type SelectabilityChange, type SelectabilityItemOptions, SelectabilityAllState, SelectabilityInteraction, SelectabilityStamping, SelectabilityStrategy } from './SelectabilityController.js'

type Person = { readonly id: number, readonly name: string }

const people: ReadonlyArray<Person> = ['Ada', 'Alan', 'Grace', 'Edsger', 'Barbara']
	.map((name, index) => ({ id: index + 1, name }))

const ids = (items: ReadonlyArray<Person>) => items.map(person => person.id)

/** Semantics only: nothing is rendered, nothing is stamped, and every interaction is explicit. */
@component('selectability-test')
class SelectabilityTest extends Component {
	selectability? = Selectability.Multiple
	items: ReadonlyArray<Person> = people
	isSelectable?: (item: Person) => boolean
	key?: (item: Person) => unknown
	behaviorOnItemsChange?: SelectabilityBehaviorOnItemsChange
	hostOwned = false
	hostSelection: ReadonlyArray<Person> = []

	readonly changes = new Array<SelectabilityChange<Person>>()
	readonly controller: SelectabilityController<Person>

	constructor() {
		super()
		const component = this
		this.controller = new SelectabilityController<Person>(this, {
			get selectability() { return component.selectability },
			get items() { return component.items },
			get isSelectable() { return component.isSelectable },
			get key() { return component.key },
			get selection() { return component.hostOwned ? component.hostSelection : undefined },
			get behaviorOnItemsChange() { return component.behaviorOnItemsChange },
			handleChange: change => {
				component.changes.push(change)
				if (component.hostOwned) {
					component.hostSelection = [...change.selection]
				}
			},
			interaction: SelectabilityInteraction.Manual,
			stamping: SelectabilityStamping.None,
		})
	}

	/** What is selected, by id — the shape every assertion below reads. */
	get selectedIds() { return ids([...this.controller.selection]) }
}

/** The rendered half: registered items, wired-up interactions and stamping. */
@component('selectability-list-test')
class SelectabilityListTest extends Component {
	selectability? = Selectability.Multiple
	items: ReadonlyArray<Person> = people
	/** The window actually rendered — the rest of the universe exists without an element. */
	rendered?: ReadonlyArray<Person>
	strategy = SelectabilityStrategy.Replace
	stamping = SelectabilityStamping.Full
	itemRole = 'option'
	hostRole = 'listbox'
	disabledIds: ReadonlyArray<number> = []

	readonly changes = new Array<SelectabilityChange<Person>>()
	readonly controller: SelectabilityController<Person>

	constructor() {
		super()
		const component = this
		this.controller = new SelectabilityController<Person>(this, {
			get selectability() { return component.selectability },
			get items() { return component.items },
			get strategy() { return component.strategy },
			get stamping() { return component.stamping },
			handleChange: change => component.changes.push(change),
		})
	}

	protected override connected() {
		this.setAttribute('role', this.hostRole)
	}

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }
	get selectedIds() { return ids([...this.controller.selection]) }

	static override get styles() {
		return css`.item { display: block; height: 20px; }`
	}

	protected override get template() {
		// Deliberately NOT keyed: lit reuses the elements positionally, which is how a virtualized
		// window hands the same element a different datum.
		return html`
			${(this.rendered ?? this.items).map((person, index) => html`
				<div class='item' role=${ifDefined(this.itemRole || undefined)} ${this.controller.item({
					index,
					data: person,
					disabled: this.disabledIds.includes(person.id),
				})}>
					${person.name}
					<span class='veto' @click=${(e: Event) => e.stopPropagation()}>×</span>
				</div>
			`)}
		`
	}
}

/**
 * The shared-registry path: the OWNER creates the registry, declares the directive ONCE per element,
 * and hands the same instance to every controller that acts on those items. The registry's options
 * carry more than selection needs — a `handle`, as a reorder would want — which is what a shared
 * registry always looks like, and what the item-options generic is for.
 */
type SharedItemOptions = SelectabilityItemOptions<Person> & { readonly handle?: string }

@component('selectability-shared-registry-test')
class SelectabilitySharedRegistryTest extends Component {
	readonly changes = new Array<SelectabilityChange<Person>>()

	readonly indexability = new IndexabilityController<Person, SharedItemOptions>(this)
	readonly controller = new SelectabilityController<Person, SharedItemOptions>(this, {
		indexability: this.indexability,
		selectability: Selectability.Multiple,
		items: people,
		handleChange: change => this.changes.push(change),
	})

	protected override connected() {
		this.setAttribute('role', 'listbox')
	}

	get itemElements() { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')] }
	get selectedIds() { return ids([...this.controller.selection]) }

	static override get styles() {
		return css`.item { display: block; height: 20px; }`
	}

	protected override get template() {
		return html`
			${people.map((person, index) => html`
				<div class='item' role='option' ${this.indexability.item({ index, data: person, handle: '.grip' })}>
					${person.name}
				</div>
			`)}
		`
	}
}

describe('SelectabilityController', () => {
	const create = (setup: Partial<SelectabilityTest> = {}) =>
		new ComponentTestFixture(() => Object.assign(new SelectabilityTest(), setup))

	const createList = (setup: Partial<SelectabilityListTest> = {}) =>
		new ComponentTestFixture(() => Object.assign(new SelectabilityListTest(), setup))

	const click = (target: EventTarget, init: MouseEventInit = {}) =>
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, ...init }))

	describe('the enum values', () => {
		// DataGrid re-exports these two under its own names and reflects them as attributes.
		it('are the strings the attributes carry', () => {
			expect(Selectability.Single).toBe('single')
			expect(Selectability.Multiple).toBe('multiple')
			expect(SelectabilityBehaviorOnItemsChange.Reset).toBe('reset')
			expect(SelectabilityBehaviorOnItemsChange.Maintain).toBe('maintain')
			expect(SelectabilityBehaviorOnItemsChange.Prevent).toBe('prevent')
		})

		// The rest are equally part of the API: a host may set them from an attribute, and the
		// stamped `data-selectability` is a styling contract.
		it('are the strings the rest of the API carries', () => {
			expect(SelectabilityInteraction.Auto).toBe('auto')
			expect(SelectabilityInteraction.Manual).toBe('manual')
			expect(SelectabilityStrategy.Replace).toBe('replace')
			expect(SelectabilityStrategy.Toggle).toBe('toggle')
			expect(SelectabilityAllState.None).toBe('none')
			expect(SelectabilityAllState.Some).toBe('some')
			expect(SelectabilityAllState.All).toBe('all')
			expect(SelectabilityStamping.Full).toBe('full')
			expect(SelectabilityStamping.Data).toBe('data')
			expect(SelectabilityStamping.None).toBe('none')
		})
	})

	describe('when selection is off', () => {
		const fixture = create({ selectability: undefined })

		it('reports itself disabled and refuses every operation', () => {
			const { controller } = fixture.component
			expect(controller.enabled).toBe(false)

			controller.select(people[0]!)
			controller.selection = [people[1]!]
			controller.selectAll()
			controller.deselectAll()
			controller.toggleAll()

			expect(fixture.component.selectedIds).toEqual([])
			expect(fixture.component.changes).toEqual([])
		})

		it('drops the selection as it goes off, rather than leaving one nothing can act on', async () => {
			fixture.component.selectability = Selectability.Multiple
			await fixture.update()
			fixture.component.controller.selection = [people[0]!, people[1]!]
			expect(fixture.component.selectedIds).toEqual([1, 2])

			fixture.component.selectability = undefined
			await fixture.update()

			expect(fixture.component.selectedIds).toEqual([])
			expect(fixture.component.controller.anchor).toBeUndefined()
		})
	})

	describe('in single selectability', () => {
		const fixture = create({ selectability: Selectability.Single })

		it('replaces the selection on a plain select', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[2]!)
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('deselects when told to, so a checkbox still toggles', () => {
			const { controller } = fixture.component
			controller.select(people[0]!, { selected: true })
			controller.select(people[0]!, { selected: false })
			expect(fixture.component.selectedIds).toEqual([])
		})

		it('ignores preserve — a second select still replaces', () => {
			const { controller } = fixture.component
			controller.select(people[0]!, { preserve: true })
			controller.select(people[1]!, { preserve: true })
			expect(fixture.component.selectedIds).toEqual([2])
		})

		it('ignores range', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[3]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([4])
		})

		it('caps a programmatic selection at one', () => {
			fixture.component.controller.selection = [people[0]!, people[1]!, people[2]!]
			expect(fixture.component.selectedIds).toEqual([1])
		})

		it('leaves selectAll alone, since there is no such thing here', () => {
			fixture.component.controller.selectAll()
			expect(fixture.component.selectedIds).toEqual([])
			expect(fixture.component.changes).toEqual([])
		})
	})

	describe('in multiple selectability', () => {
		const fixture = create()

		it('replaces the selection on a plain select', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[1]!]
			controller.select(people[3]!)
			expect(fixture.component.selectedIds).toEqual([4])
		})

		it('adds and removes on a preserving select, leaving the rest', () => {
			const { controller } = fixture.component
			controller.select(people[0]!, { preserve: true, selected: true })
			controller.select(people[2]!, { preserve: true, selected: true })
			expect(fixture.component.selectedIds).toEqual([1, 3])

			controller.select(people[0]!, { preserve: true, selected: false })
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('toggles when a preserving select does not say which way', () => {
			const { controller } = fixture.component
			controller.select(people[0]!, { preserve: true })
			expect(fixture.component.selectedIds).toEqual([1])
			controller.select(people[0]!, { preserve: true })
			expect(fixture.component.selectedIds).toEqual([])
		})

		it('never lets a key appear twice', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[0]!, people[1]!]
			expect(fixture.component.selectedIds).toEqual([1, 2])
		})
	})

	describe('ranges', () => {
		const fixture = create()

		it('extends from the anchor, in either direction', () => {
			const { controller } = fixture.component
			controller.select(people[1]!)
			controller.select(people[3]!, { range: true })
			expect(fixture.component.selectedIds.sort()).toEqual([2, 3, 4])

			controller.select(people[3]!)
			controller.select(people[1]!, { range: true })
			expect(fixture.component.selectedIds.sort()).toEqual([2, 3, 4])
		})

		it('appends to the selection rather than re-sorting it — the order is the order things were picked in', () => {
			const { controller } = fixture.component
			controller.select(people[3]!)
			controller.select(people[1]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([4, 2, 3])
		})

		it('follows the ANCHOR’s state, not the picked item’s — an anchor left deselected subtracts', () => {
			const { controller } = fixture.component
			controller.selectAll()
			controller.select(people[1]!, { preserve: true, selected: false })
			expect(fixture.component.selectedIds).toEqual([1, 3, 4, 5])

			controller.select(people[3]!, { range: true, preserve: true, selected: false })
			expect(fixture.component.selectedIds).toEqual([1, 5])
		})

		it('re-anchors on a range select, so successive ranges carry the selection onward', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[2]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3])

			controller.select(people[4]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3, 4, 5])
			expect(controller.anchor?.item.id).toBe(5)
		})

		it('beats preserve, which a checkbox passes on every click', () => {
			const { controller } = fixture.component
			controller.select(people[0]!, { preserve: true, selected: true })
			controller.select(people[2]!, { preserve: true, selected: true, range: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3])
		})

		it('degrades to a plain select when there is no anchor yet', () => {
			fixture.component.controller.select(people[2]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('degrades rather than guessing when the anchor has left the universe', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			fixture.component.items = people.slice(2) // the anchor is gone
			controller.select(people[4]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([5])
		})

		it('steps over unselectable items rather than dragging them in', () => {
			fixture.component.isSelectable = person => person.id !== 3
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[3]!, { range: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 4])
		})

		it('spans items that were never rendered', () => {
			// The universe here is entirely element-less, which is what a paged grid's is.
			const fixture2 = fixture.component
			fixture2.controller.select(people[0]!)
			fixture2.controller.select(people[4]!, { range: true })
			expect(fixture2.selectedIds).toEqual([1, 2, 3, 4, 5])
		})
	})

	describe('the anchor', () => {
		const fixture = create()

		it('moves to every picked item, deselections included', () => {
			const { controller } = fixture.component
			controller.select(people[1]!)
			expect(controller.anchor).toEqual({ item: people[1]!, selected: true })

			controller.select(people[3]!, { preserve: true, selected: false })
			expect(controller.anchor).toEqual({ item: people[3]!, selected: false })
		})

		it('is dropped by the bulk operations, which have no last item', () => {
			const { controller } = fixture.component
			controller.select(people[1]!)
			controller.selectAll()
			expect(controller.anchor).toBeUndefined()

			controller.select(people[1]!)
			controller.deselectAll()
			expect(controller.anchor).toBeUndefined()
		})
	})

	describe('identity', () => {
		describe('by reference', () => {
			const fixture = create()

			it('treats an equal-but-distinct instance as a different item', () => {
				const { controller } = fixture.component
				controller.selection = [people[0]!]
				expect(controller.isSelected(people[0]!)).toBe(true)
				expect(controller.isSelected({ ...people[0]! })).toBe(false)
			})
		})

		describe('by key', () => {
			const fixture = create({ key: (person: Person) => person.id })

			it('recognises the same item in another instance', () => {
				const { controller } = fixture.component
				controller.selection = [people[0]!]
				expect(controller.isSelected({ ...people[0]! })).toBe(true)
			})

			it('de-duplicates by it', () => {
				fixture.component.controller.selection = [people[0]!, { ...people[0]! }]
				expect(fixture.component.selectedIds).toEqual([1])
			})

			it('resolves a range across replaced instances', () => {
				const { controller } = fixture.component
				controller.select(people[0]!)
				fixture.component.items = people.map(person => ({ ...person })) // a refetch
				controller.select(fixture.component.items[2]!, { range: true })
				expect(fixture.component.selectedIds).toEqual([1, 2, 3])
			})
		})
	})

	describe('unselectable items', () => {
		const fixture = create({ isSelectable: (person: Person) => person.id !== 2 })

		it('cannot be picked', () => {
			fixture.component.controller.select(people[1]!)
			expect(fixture.component.selectedIds).toEqual([])
			expect(fixture.component.changes).toEqual([])
		})

		it('are dropped from a programmatic selection', () => {
			fixture.component.controller.selection = [...people]
			expect(fixture.component.selectedIds).toEqual([1, 3, 4, 5])
		})

		it('are left out of selectAll, and do not keep allState off `all`', () => {
			fixture.component.controller.selectAll()
			expect(fixture.component.selectedIds).toEqual([1, 3, 4, 5])
			expect(fixture.component.controller.allState).toBe(SelectabilityAllState.All)
		})
	})

	describe('bulk operations', () => {
		const fixture = create()

		it('report none, some and all', () => {
			const { controller } = fixture.component
			expect(controller.allState).toBe(SelectabilityAllState.None)

			controller.select(people[0]!)
			expect(controller.allState).toBe(SelectabilityAllState.Some)

			controller.selectAll()
			expect(controller.allState).toBe(SelectabilityAllState.All)
		})

		it('toggle all the way on from nothing, and all the way off from anything', () => {
			const { controller } = fixture.component
			controller.toggleAll()
			expect(controller.allState).toBe(SelectabilityAllState.All)

			controller.toggleAll()
			expect(controller.allState).toBe(SelectabilityAllState.None)

			controller.select(people[0]!)
			controller.toggleAll()
			expect(controller.allState).toBe(SelectabilityAllState.None)
		})
	})

	describe('when the items change', () => {
		const fixture = create({ key: (person: Person) => person.id })

		it('resets by default', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[1]!]
			fixture.component.items = people.map(person => ({ ...person }))
			controller.handleItemsChange()
			expect(fixture.component.selectedIds).toEqual([])
		})

		it('maintains by re-resolving onto the new instances', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[2]!]
			const refetched = people.map(person => ({ ...person }))
			fixture.component.items = refetched

			controller.handleItemsChange(SelectabilityBehaviorOnItemsChange.Maintain)

			expect(fixture.component.selectedIds).toEqual([1, 3])
			expect(controller.selection[0]).toBe(refetched[0]!) // the NEW instance, not the old one
		})

		it('maintains the anchor too, so the next range still has somewhere to start', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			const refetched = people.map(person => ({ ...person }))
			fixture.component.items = refetched

			controller.handleItemsChange(SelectabilityBehaviorOnItemsChange.Maintain)
			controller.select(refetched[2]!, { range: true })

			expect(fixture.component.selectedIds).toEqual([1, 2, 3])
		})

		it('drops a selected item the new items no longer have', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[4]!]
			fixture.component.items = people.slice(0, 3)
			controller.handleItemsChange(SelectabilityBehaviorOnItemsChange.Maintain)
			expect(fixture.component.selectedIds).toEqual([1])
		})

		it('leaves everything alone when told to prevent, items it no longer has included', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[4]!]
			fixture.component.items = people.slice(0, 2)
			controller.handleItemsChange(SelectabilityBehaviorOnItemsChange.Prevent)
			expect(fixture.component.selectedIds).toEqual([1, 5])
		})

		it('takes its default from the options', () => {
			fixture.component.behaviorOnItemsChange = SelectabilityBehaviorOnItemsChange.Prevent
			fixture.component.controller.selection = [people[0]!]
			fixture.component.controller.handleItemsChange()
			expect(fixture.component.selectedIds).toEqual([1])
		})
	})

	describe('the change callback', () => {
		const fixture = create()

		it('fires once per command, with what came and went', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!, people[1]!]
			controller.select(people[2]!)

			expect(fixture.component.changes.length).toBe(2)
			expect(ids([...fixture.component.changes[1]!.selection])).toEqual([3])
			expect(ids([...fixture.component.changes[1]!.added])).toEqual([3])
			expect(ids([...fixture.component.changes[1]!.removed])).toEqual([1, 2])
		})

		it('stays quiet when the command changed nothing', () => {
			const { controller } = fixture.component
			controller.selection = [people[0]!]
			controller.selection = [people[0]!]
			controller.select(people[0]!)
			controller.deselectAll()
			controller.deselectAll()

			expect(fixture.component.changes.length).toBe(2) // the select and the deselect
		})
	})

	describe('state ownership', () => {
		const hostFixture = create({ hostOwned: true })
		const ownFixture = create()

		it('reads and writes the host’s own property when it has one', () => {
			hostFixture.component.controller.selection = [people[0]!, people[1]!]
			expect(ids([...hostFixture.component.hostSelection])).toEqual([1, 2])
			expect(hostFixture.component.selectedIds).toEqual([1, 2])
		})

		it('picks up a selection assigned from outside, with no loop and no fence', () => {
			hostFixture.component.hostSelection = [people[3]!]
			expect(hostFixture.component.controller.isSelected(people[3]!)).toBe(true)
			expect(hostFixture.component.changes.length).toBe(0) // an assignment is not a change to report

			hostFixture.component.controller.select(people[4]!, { preserve: true })
			expect(hostFixture.component.selectedIds).toEqual([4, 5])
		})

		it('keeps the selection itself when the host has no property for it', () => {
			ownFixture.component.controller.selection = [people[2]!]
			expect(ownFixture.component.selectedIds).toEqual([3])
		})
	})

	describe('modifiers', () => {
		const fixture = create()

		it('come from the event when it carries them', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[2]!, { event: new MouseEvent('click', { shiftKey: true }) })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3])
		})

		it('yield to explicit flags', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[2]!, { range: false, event: new MouseEvent('click', { shiftKey: true }) })
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('read ctrl and meta as preserve', () => {
			const { controller } = fixture.component
			controller.select(people[0]!)
			controller.select(people[2]!, { event: new MouseEvent('click', { ctrlKey: true }) })
			expect(fixture.component.selectedIds).toEqual([1, 3])

			controller.select(people[2]!, { event: new MouseEvent('click', { metaKey: true }) })
			expect(fixture.component.selectedIds).toEqual([1])
		})

		it('fall back on the last real input where the event carries none — which is what a control’s change event is', () => {
			const { component } = fixture
			component.controller.select(people[0]!)

			// The shift lands on the host as a pointerdown; the control then reports itself with a
			// plain CustomEvent, which knows nothing about any key.
			component.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))
			component.controller.select(people[2]!, { preserve: true, selected: true, event: new CustomEvent('change') })

			expect(component.selectedIds).toEqual([1, 2, 3])
		})

		it('are cleared by an input that carries none, so keyboard activation never ranges', () => {
			const { component } = fixture
			component.controller.select(people[0]!)
			component.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))
			// What Enter/Space activation synthesises: a click with no modifier state at all.
			component.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }))

			component.controller.select(people[2]!, { event: new CustomEvent('change') })
			expect(component.selectedIds).toEqual([3])
		})

		it('are loosened by a keyup, and dropped by a blur', () => {
			const { component } = fixture
			component.controller.select(people[0]!)
			component.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))
			window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift', shiftKey: false }))

			component.controller.select(people[2]!, { event: new CustomEvent('change') })
			expect(component.selectedIds).toEqual([3])
		})

		it('are per controller — one host’s shift is not another’s', () => {
			const other = new SelectabilityTest()
			document.body.appendChild(other)
			try {
				fixture.component.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true, shiftKey: true }))
				other.controller.select(people[0]!)
				other.controller.select(people[2]!, { event: new CustomEvent('change') })
				expect(ids([...other.controller.selection])).toEqual([3])
			} finally {
				other.remove()
			}
		})
	})

	describe('wired up to the host', () => {
		const fixture = createList()

		it('picks the item a click landed on', () => {
			click(fixture.component.itemElements[2]!)
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('replaces on a plain click, adds on ctrl, extends on shift', () => {
			const items = fixture.component.itemElements
			click(items[0]!)
			click(items[2]!, { ctrlKey: true })
			expect(fixture.component.selectedIds).toEqual([1, 3])

			click(items[4]!, { shiftKey: true })
			expect(fixture.component.selectedIds).toEqual([1, 3, 4, 5])
		})

		it('lets a region veto by stopping the click', () => {
			click(fixture.component.itemElements[1]!.querySelector('.veto')!)
			expect(fixture.component.selectedIds).toEqual([])
		})

		it('leaves a disabled item alone', async () => {
			fixture.component.disabledIds = [2]
			await fixture.update()
			click(fixture.component.itemElements[1]!)
			expect(fixture.component.selectedIds).toEqual([])
		})

		it('selects everything on ctrl+A', () => {
			fixture.component.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true, composed: true }))
			expect(fixture.component.selectedIds).toEqual([1, 2, 3, 4, 5])
		})

		it('ranges across items that have no element', async () => {
			fixture.component.rendered = [people[0]!, people[4]!] // only the ends are on screen
			await fixture.update()
			const items = fixture.component.itemElements

			click(items[0]!)
			click(items[1]!, { shiftKey: true })

			expect(fixture.component.selectedIds).toEqual([1, 2, 3, 4, 5])
		})
	})

	describe('wired up with the toggle strategy', () => {
		const fixture = createList({ strategy: SelectabilityStrategy.Toggle })

		it('adds and removes on every plain click, as though each item were a checkbox', () => {
			const items = fixture.component.itemElements
			click(items[0]!)
			click(items[2]!)
			expect(fixture.component.selectedIds).toEqual([1, 3])

			click(items[0]!)
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('still extends on shift', () => {
			const items = fixture.component.itemElements
			click(items[0]!)
			click(items[2]!, { shiftKey: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3])
		})
	})

	describe('with an adopted registry', () => {
		const fixture = new ComponentTestFixture(() => new SelectabilitySharedRegistryTest())

		it('reads the owner’s registry rather than creating its own', () => {
			expect(fixture.component.controller.indexability).toBe(fixture.component.indexability)
			expect(fixture.component.controller.item).toBe(fixture.component.indexability.item)
		})

		it('resolves a click on an item the OWNER registered', () => {
			click(fixture.component.itemElements[2]!)
			expect(fixture.component.selectedIds).toEqual([3])
		})

		it('brings its gestures along — shift still extends over the run', () => {
			click(fixture.component.itemElements[0]!)
			click(fixture.component.itemElements[3]!, { shiftKey: true })
			expect(fixture.component.selectedIds).toEqual([1, 2, 3, 4])
		})

		it('stamps state onto elements it never registered itself', () => {
			click(fixture.component.itemElements[1]!)
			const stamps = fixture.component.itemElements.map(element => element.dataset.selectability)
			expect(stamps).toEqual(['unselected', 'selected', 'unselected', 'unselected', 'unselected'])
			expect(fixture.component.itemElements[1]!.getAttribute('aria-selected')).toBe('true')
		})
	})

	describe('stamping', () => {
		const fixture = createList()
		const checkboxFixture = createList({ itemRole: 'menuitemcheckbox', hostRole: 'menu' })
		const rolelessFixture = createList({ itemRole: '' })
		const dataFixture = createList({ stamping: SelectabilityStamping.Data })
		const noneFixture = createList({ stamping: SelectabilityStamping.None })

		it('marks every item, selected or not', () => {
			click(fixture.component.itemElements[1]!)
			const stamps = fixture.component.itemElements.map(element => element.dataset.selectability)
			expect(stamps).toEqual(['unselected', 'selected', 'unselected', 'unselected', 'unselected'])
		})

		it('announces the state its role calls for', () => {
			click(fixture.component.itemElements[1]!)
			expect(fixture.component.itemElements[1]!.getAttribute('aria-selected')).toBe('true')
			expect(fixture.component.itemElements[0]!.getAttribute('aria-selected')).toBe('false')
		})

		it('announces a checkable role as checked instead', () => {
			click(checkboxFixture.component.itemElements[1]!)
			expect(checkboxFixture.component.itemElements[1]!.getAttribute('aria-checked')).toBe('true')
			expect(checkboxFixture.component.itemElements[1]!.hasAttribute('aria-selected')).toBe(false)
		})

		it('says nothing about a role that has no selected state', () => {
			click(rolelessFixture.component.itemElements[1]!)
			const item = rolelessFixture.component.itemElements[1]!
			expect(item.dataset.selectability).toBe('selected')
			expect(item.hasAttribute('aria-selected')).toBe(false)
			expect(item.hasAttribute('aria-checked')).toBe(false)
		})

		it('tells the host it takes more than one', async () => {
			expect(fixture.component.hasAttribute('aria-multiselectable')).toBe(true)

			fixture.component.selectability = Selectability.Single
			await fixture.update()
			expect(fixture.component.hasAttribute('aria-multiselectable')).toBe(false)
		})

		it('leaves ARIA to the host when asked for the attribute alone', () => {
			click(dataFixture.component.itemElements[1]!)
			const item = dataFixture.component.itemElements[1]!
			expect(item.dataset.selectability).toBe('selected')
			expect(item.hasAttribute('aria-selected')).toBe(false)
			expect(dataFixture.component.hasAttribute('aria-multiselectable')).toBe(false)
		})

		it('writes nothing at all when asked for none', () => {
			click(noneFixture.component.itemElements[1]!)
			expect(noneFixture.component.selectedIds).toEqual([2])
			expect(noneFixture.component.itemElements[1]!.dataset.selectability).toBeUndefined()
		})

		it('follows an element handed a different datum, as a virtualized window does', async () => {
			const { component } = fixture
			component.controller.selection = [people[4]!]
			component.rendered = [people[0]!]
			await fixture.update()
			const element = component.itemElements[0]!
			expect(element.dataset.selectability).toBe('unselected')

			component.rendered = [people[4]!] // the same element, a different person
			await fixture.update()
			expect(component.itemElements[0]!).toBe(element) // lit reused it, as a virtualized window does
			expect(element.dataset.selectability).toBe('selected')
		})
	})
})