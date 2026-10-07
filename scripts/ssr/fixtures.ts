import FileSystem from 'fs'
import Path from 'path'

// Consumers import a package, not one of its files, and only the entry point establishes the
// module order the package is written for. Deep imports are therefore not representative and
// would report unrelated circular import failures as missing SSR support.
export function entryPointOf(path: string) {
	let directory = Path.dirname(path)
	while (directory.includes('packages')) {
		if (FileSystem.existsSync(`${directory}/package.json`) && FileSystem.existsSync(`${directory}/index.ts`)) {
			return `${directory}/index.ts`
		}
		directory = Path.dirname(directory)
	}
	return path
}

// A component rendered without content says nothing about whether it hydrates with the content it is
// used with, since a server cannot see the light DOM. Components shaped by their content, and
// components which only exist inside a parent, are therefore rendered as they are used.
const fixtures: Record<string, string> = {
	'mo-accordion': '<mo-accordion><mo-accordion-item heading="One">First</mo-accordion-item><mo-accordion-item heading="Two">Second</mo-accordion-item></mo-accordion>',
	'mo-alert': '<mo-alert heading="Heading">Message</mo-alert>',
	'mo-button-group': '<mo-button-group type="outlined"><mo-button type="outlined">One</mo-button><mo-button type="outlined">Two</mo-button></mo-button-group>',
	'mo-card': '<mo-card heading="Heading"><mo-icon-button slot="action" icon="more_vert"></mo-icon-button>Content<mo-button slot="footer">Action</mo-button></mo-card>',
	'mo-checkbox-group': '<mo-checkbox-group label="Group"><mo-checkbox label="One"></mo-checkbox><mo-checkbox label="Two"></mo-checkbox></mo-checkbox-group>',
	'mo-chip': '<mo-chip>Chip</mo-chip>',
	'mo-chip-group': '<mo-chip-group><mo-chip>One</mo-chip><mo-chip>Two</mo-chip></mo-chip-group>',
	'mo-checkbox': '<mo-checkbox label="Checked" selected></mo-checkbox>',
	'mo-entity-dialog': '<mo-entity-dialog heading="Person" .parameters=${{ id: 1 }}></mo-entity-dialog>',
	'mo-data-grid': '<mo-data-grid exportable .data=${[{ name: "Ada", balance: 1 }, { name: "Grace", balance: 2 }]}></mo-data-grid>',
	'mo-dialog-alert': '<mo-dialog-alert .parameters=${{ heading: "Heading", content: "Message" }}></mo-dialog-alert>',
	'mo-dialog-deletion': '<mo-dialog-deletion .parameters=${{ label: "Ada" }}></mo-dialog-deletion>',
	'mo-generic-dialog': '<mo-generic-dialog .parameters=${{ heading: "Heading", content: "Message" }}></mo-generic-dialog>',
	'mo-moddable-data-grid-chip': '<mo-moddable-data-grid-chip .mode=${{ name: "Mine" }} .dataGrid=${{ hasUnsavedChanges: false }}></mo-moddable-data-grid-chip>',
	'mo-collapsible-list-item': '<mo-collapsible-list-item><mo-list-item>Parent</mo-list-item><mo-list-item slot="details">Child</mo-list-item></mo-collapsible-list-item>',
	'mo-fab': '<mo-fab icon="add">Add</mo-fab>',
	'mo-fab-group': '<mo-fab-group><mo-fab icon="add">Add</mo-fab><mo-fab icon="edit">Edit</mo-fab></mo-fab-group>',
	'mo-field': '<mo-field label="Label"><mo-icon slot="start" icon="search"></mo-icon><input><mo-icon slot="end" icon="close"></mo-icon></mo-field>',
	'mo-key': '<mo-key>Meta+P</mo-key>',
	'mo-key-value': '<mo-key-value key="Key">Value</mo-key-value>',
	'mo-list': '<mo-list><mo-list-item>One</mo-list-item><mo-list-item>Two</mo-list-item></mo-list>',
	'mo-master-detail': '<mo-master-detail><div slot="master">Master</div><div slot="detail">Detail</div></mo-master-detail>',
	'mo-menu-bar': '<mo-menu-bar><mo-menu-bar-item>File</mo-menu-bar-item><mo-menu-bar-item>Edit</mo-menu-bar-item></mo-menu-bar>',
	'mo-nested-menu-item': '<mo-nested-menu-item>Parent<mo-menu-item slot="submenu">Child</mo-menu-item></mo-nested-menu-item>',
	'mo-option': '<mo-option value="1">One</mo-option>',
	'mo-page': '<mo-page heading="Heading"><mo-icon-button slot="action" icon="more_vert"></mo-icon-button>Content</mo-page>',
	'mo-section': '<mo-section heading="Heading"><mo-icon-button slot="action" icon="more_vert"></mo-icon-button>Content</mo-section>',
	'mo-selection-group': '<mo-selection-group><mo-selectable-button value="one">One</mo-selectable-button><mo-selectable-button value="two">Two</mo-selectable-button></mo-selection-group>',
	'mo-split-button': '<mo-split-button><mo-button type="filled">Save</mo-button><mo-menu-item slot="more">Save as</mo-menu-item></mo-split-button>',
	'mo-splitter': '<mo-splitter><mo-splitter-item>Master</mo-splitter-item><mo-splitter-item>Detail</mo-splitter-item></mo-splitter>',
	'mo-swap': '<mo-swap value="done"><span>Copy</span><span slot="done">Copied</span></mo-swap>',
	'mo-tab-bar': '<mo-tab-bar value="one"><mo-tab value="one">One</mo-tab><mo-tab value="two">Two</mo-tab></mo-tab-bar>',
	'mo-tabs': '<mo-tabs value="one"><mo-tab value="one">One</mo-tab><mo-tab value="two">Two</mo-tab><mo-tab-panel slot="panel" value="one">First</mo-tab-panel><mo-tab-panel slot="panel" value="two">Second</mo-tab-panel></mo-tabs>',
	'mo-timeline-item': '<mo-timeline-item icon="check" meta="Today">Done</mo-timeline-item>',
	'mo-toolbar': '<mo-toolbar><mo-toolbar-pane><mo-icon-button icon="undo"></mo-icon-button><mo-icon-button icon="redo"></mo-icon-button></mo-toolbar-pane></mo-toolbar>',
	'mo-tree': '<mo-tree><mo-tree-item open>Documents<mo-tree-item slot="children">Taxes</mo-tree-item></mo-tree-item><mo-tree-item>Pictures</mo-tree-item></mo-tree>',
}

// Components a parent renders in its shadow root are rendered, and hydrated, through that parent:
for (const tag of ['mo-data-grid-cell', 'mo-data-grid-column-header', 'mo-data-grid-default-row', 'mo-data-grid-footer', 'mo-data-grid-header']) {
	fixtures[tag] = fixtures['mo-data-grid']!
}
fixtures['mo-accordion-item'] = fixtures['mo-accordion']!
fixtures['mo-menu-bar-item'] = fixtures['mo-menu-bar']!
fixtures['mo-splitter-item'] = fixtures['mo-splitter']!
fixtures['mo-tab'] = fixtures['mo-tab-bar']!
fixtures['mo-tab-panel'] = fixtures['mo-tabs']!
fixtures['mo-toolbar-pane'] = fixtures['mo-toolbar']!
fixtures['mo-tree-item'] = fixtures['mo-tree']!

/**
 * The markup a component is rendered with. Every custom element defers its hydration, so that the
 * hydration harness decides when each one hydrates and can attribute a failure to the component.
 */
export function markupOf(tag: string) {
	return (fixtures[tag] ?? `<${tag}></${tag}>`).replace(/<(mo-[\w-]+)/g, '<$1 defer-hydration')
}
