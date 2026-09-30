# AGENTS.md

A guide for coding agents working in this repository: how it is organized, how to write and verify code here, and the traps that have already cost time. Read it before starting; the rules below are true of the code as it is.

## The library

- Web components for business web applications, built with Lit and inspired by Material 3. Elements are `mo-*` custom elements; every package is published as `@3mo/<name>`.
- Many elements wrap `@material/web` (`md-*`) controls; newer ones render native elements themselves (e.g. `mo-chip` on a native `<button>`).
- Behaviour lives in headless Lit reactive controllers: `-ability` primitives (`IndexabilityController`, `NavigabilityController`, `SelectabilityController`, `ExpandabilityController`, `ReorderabilityController`, `SwipeabilityController`, …) and pattern controllers composed from them (`ListboxController`, `ComboboxController`, `MenuController`, `MenuBarController`, `TreeController`, `SelectionGroupController`, `DataGridController`). Elements are the design layer on top.
- `@3mo/del` (`packages/DesignLibrary`) re-exports every package plus `@a11d/lit` and the application framework `@a11d/lit-application`. Applications import almost everything from it.

| Stack | Notes |
| --- | --- |
| Lit through `@a11d/lit` | Import `Component`, `component`, `html`, `css`, `property`, `state`, `event`, `query`, `eventListener`, `Controller`, `ElementRef`, `bind` from `@a11d/lit`, never from `lit` directly. |
| TypeScript 6 and 7 side by side | `typescript` is 6.x (typescript-eslint and `ts-lit-plugin` need its JS API); the native compiler is the `typescript-7` alias, run as `node ./node_modules/typescript-7/bin/tsc`. Do not collapse the two. `experimentalDecorators` and `useDefineForClassFields: false` are required. |
| Vitest 5 browser mode on Playwright | Specs run in real Chromium and Firefox. |
| Storybook 10, `@storybook/web-components-vite` | The Storybook is the documentation site; component pages are generated from stories and JSDoc. |
| `web-component-analyzer` (`wca`) | Produces `custom-elements.json`, post-processed by `scripts/analyze.ts`. |

## Repository map

| Path | What it is |
| --- | --- |
| `packages/<Name>/` | One npm package each (mostly PascalCase directories). Source, `*.stories.ts`, `*.test.ts`, `stories/` demos and `<Name>.mdx` section pages sit side by side. |
| `packages/DesignLibrary/` | `@3mo/del`, the aggregate, plus the business-suite app shell. |
| `packages/tsconfig.json` | Type-checks specs, stories, demos, `samples/` and `stories/` (never emitted). |
| `stories/` | Central sample data for stories and demos: `people`, `employees`, `companies`, `countries`, `photos`, and `respond()` to fake a request. |
| `samples/<recipe>/` | Recipes: complete screens built from the pieces, `recipe-*` elements, a private `package.json`. Shown under Recipes. |
| `.storybook/` | Storybook config: `main.ts` (aliases every `@3mo/*` to its `index.ts`, full-reload plugin), `preview.ts`, `blocks.tsx` (docs blocks), `source.ts` (Show code, `sourceOf`), `lazy.ts`, `globals.ts` (theme and language toolbar), `stories.test.ts` (smoke test), `docs/*.mdx` (Getting Started, Contributing). |
| `scripts/` | `analyze.ts`, `readme.ts`, `changelog.ts`, `bump.ts`, `release.ts`, `pre-commit.ts`, `clean.ts`, `docs-build.ts`, `llms.ts`, `vitest-setup.ts`, helpers in `util/`. |
| `vitest.config.ts` | Projects `specs` (instances `chromium`, `firefox`) and `stories`. |
| `.github/workflows/` | `qa.yml` runs `npm run typescript`, `npm run lint` and `npm run test` on every PR and push to main; `development.yml` also deploys the Storybook to GitHub Pages and, after QA, runs `npm run release` on every push to main. |

Generated files, never edited by hand:

- `custom-elements.json` (root, and `dist/custom-elements.json` per package): `npm run analyze`. Gitignored.
- `packages/*/README.md` and the root `README.md`: `npm run readme`. Committed, but projected from `package.json`, JSDoc and stories; change those instead.
- `packages/*/CHANGELOG.md` and the root `CHANGELOG.md`: `npm run changelog`, from git history. Gitignored.
- `docs-dist/`: the built Storybook of `npm run docs:build`, which ends with `npm run llms`, writing into it `llms.txt`, `llms-full.txt` and `docs/<page id>.md`, every page as Markdown. Gitignored. A Storybook dev server renders the same files on request, at `/llms.txt` and `/docs/<page id>.md`.
- `dist/` and `*.tsbuildinfo`: compiler output and incremental cache.

## Commands

| Command | Use |
| --- | --- |
| `npx vitest run --project chromium packages/<Name>/<File>.test.ts` | The spec you are writing. A path filter narrows to files; `-t '<name>'` to tests. |
| `npx vitest run --project chromium packages/<Name>` then `--project firefox` | A package, and its direct consumers when the change reaches them. |
| `npm run dev` | Vitest watch mode, Chromium only. |
| `npm test` | The whole suite in both browsers (several minutes). Only before handing over a branch. |
| `npx vitest run --project stories` | Smoke test: renders every story tagged `test` (the default; `tags: ['!test']` opts out) and fails on thrown errors, rejections and elements rendered without a definition. `-t 'Actions / Button'` narrows to one title. |
| `npm run typescript` | Three checks: `tsc --build --noEmit` over the packages and scripts, `tsc -p packages/tsconfig.json` (specs, stories, demos, samples), `tsc -p .storybook/tsconfig.json`. |
| `npx eslint <files>` | Lint what you touched; `npm run lint` lints everything. |
| `npm run analyze` | Regenerates the manifest. Needed before Storybook starts in a fresh checkout and after any JSDoc change. |
| `npm run readme -- <@3mo/name or Directory>` | Regenerates one package's README; no argument regenerates all, `--root` only the root table. |
| `npm run changelog` | Regenerates the changelogs. |
| `npm run bump -- [<@3mo/name or Directory>...] [<patch|minor|major|prerelease>]` | Bumps the versions and regenerates the manifest and those READMEs. Without names, bumps every package with uncommitted changes whose version is not bumped yet; the type defaults to `patch`. `premajor`, `preminor` and `prepatch` work too; prereleases are `-preview.<n>`. |
| `npm run peers` | Fails when a package lists another `@3mo/*` package or a shared external under `dependencies` instead of `peerDependencies`; `-- --fix` moves them. Runs in CI. |
| `npm run release -- --dry-run` | Lists the versions a release would publish, in publish order, and the packages with changes their published version lacks. Reads npm and git only. |
| `npm run llms -- <directory>` | Writes the Markdown pages, `llms.txt` and `llms-full.txt` into a built Storybook (`docs-dist` by default), from its `index.json`. |
| `npx storybook dev -p 3010 --ci --no-open` | A Storybook dev server. Needs `custom-elements.json`. |

- Do not run `npm start`, `npm run clean`, `npm run build` or `npm run release` without `--dry-run`. `clean` deletes every `dist/`, and `npm run typescript` relies on the warm incremental cache in `dist/*.tsbuildinfo`. Never delete `dist/` or `*.tsbuildinfo` to fix type errors.
- Phantom "has no exported member" or type errors naming shapes that no longer exist mean a stale incremental cache: run `node ./node_modules/typescript-7/bin/tsc --build --force --noEmit` once. To check one package in isolation: `node ./node_modules/typescript-7/bin/tsc -p packages/<Name>/tsconfig.json --noEmit`.
- Storybook reloads the page by itself after any source edit (custom elements cannot be hot-replaced). Restart it after adding a story file, a new story export in an existing file, a new MDX page, or editing `manager-head.html`: the story index is built at startup. Check `http://localhost:<port>/index.json` for a story id before concluding a story is broken.
- A fresh git worktree has no `node_modules`, so `@3mo/*` resolve to the main checkout's packages. Run `npm install` in the worktree (workspaces link `@3mo/*` to its own `packages/`) before trusting any test, type-check or story. When linking by hand on Windows, use junctions, and never `Remove-Item -Recurse` a junction: it deletes through into the target.

## Packages

A package directory holds:

- `package.json`: `name` (`@3mo/<kebab-name>`), `version`, `description`, `repository` (`url` + `directory: packages/<Name>`), `bugs`, `keywords`, `author: "3MO GmbH"`, `license: "MIT"`, `homepage`, `type: module`, `main: dist/index.js`, `types: dist/index.d.ts`, `customElements: dist/custom-elements.json`, `files: ["dist", "CHANGELOG.md"]`. Other `@3mo/*` packages, `@a11d/lit`, `@a11d/lit-application`, `@material/web` and `@lit-labs/virtualizer` go in `peerDependencies`, every other library in `dependencies`. An application must load one copy of each package that defines elements or shares their state; npm installs peers next to the application and refuses a second copy instead of nesting one. Ranges are `"x"` unless a version floor is needed (`">=0.13.0"`); `@a11d/lit-testing` is a dev dependency.
- `description`: one sentence, at most 130 characters, in one form: "A web component for …", "Web components for …", "A Lit controller for …", "A utility for …", then what sets it apart, with a dependency as "built on …". It is what npm search shows and the lead of pages without a component.
- `homepage`: the package's Storybook page, `https://3mo-esolutions.github.io/web-components/?path=/docs/<section>-<name>--overview`, or its GitHub tree for a package without one. The README picks its primary stories file from this id.
- `tsconfig.json`: extends `../../tsconfig.base.json`, `outDir: ./dist`, and excludes `./dist`, `**/*.config.*`, `**/*.stories.ts`, `**/stories/**`, `**/*.test.ts`, so nothing but source is published.
- `index.ts`: `export * from './X.js'` per module (relative imports carry `.js`), plus bare imports of packages whose elements it renders.

A new package also needs:

1. A reference in the root `tsconfig.json`.
2. An entry in `packages/DesignLibrary/package.json` `peerDependencies` and an `export * from '@3mo/<name>'` in `packages/DesignLibrary/index.ts`, appended last. Watch for `export *` name collisions (TS2308); del imports `@3mo/key` bare and re-exports only its types for this reason.
3. `npm install` to link the workspace, a stories file, then `npm run analyze` and `npm run readme -- @3mo/<name>`.

- A package owns what it renders. An element belongs to the package that renders it, not to the one whose name it shares.
- A controller stays in its element's package until a second package needs it.

## Writing a component

The shape of an element, after `packages/Swap/Swap.ts`:

```ts
/**
 * A box that transitions between several pieces of content, showing one at a time.
 *
 * @element mo-swap
 *
 * @attr value - The name of the slot which is shown. Empty shows the default slot.
 *
 * @slot - Shown as long as "value" is empty.
 * @slot [name] - Shown while "value" is the name of the slot.
 *
 * @cssprop --mo-swap-transition-duration - The duration of the transition between two values.
 *
 * @fires change - Dispatched with the new value whenever another slot is shown.
 */
@component('mo-swap')
export class Swap extends Component {
	@event() readonly change!: EventDispatcher<string>

	@property({ reflect: true, bindingDefault: true, event: 'change' }) value = ''

	protected readonly slotController = new SlotController(this)

	static override get styles() {
		return css`
			:host {
				display: inline-grid;
			}
		`
	}

	protected override get template() {
		return html`<slot name=${this.value}></slot>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-swap': Swap
	}
}
```

- The analyzer discovers tags from `HTMLElementTagNameMap`, not from `@component`. A class without that block is missing from the manifest, the API table and the README; a key that does not match the `@component` name is reported by `npm run analyze`.
- Lifecycle hooks of `Component`: `initialized()`, `connected()`, `disconnected()`, `firstUpdated()`, and the `template` getter instead of `render()`. Element styles go in `static override get styles()`.
- `@property({ updated() { … } })` runs a hook after the property changes. `EventDispatcher<T>` is a global type; dispatch with `this.change.dispatch(value)`.

### JSDoc tags

| Tag | Feeds |
| --- | --- |
| First sentence of the class JSDoc | The lead of the Storybook page and of the README. Further paragraphs follow it. |
| `@element mo-x` | The tag. Keep any description off this line, or the analyzer emits a phantom tag. |
| `@attr`, `@slot`, `@cssprop`, `@csspart`, `@fires` | One line each; the API table and README. |
| JSDoc on a property | A public property without an attribute appears in the API table only when documented; undocumented members count as internal. `@ignore` hides a member. |
| `@accessibility` | A Markdown section (tables allowed) on an element or controller class: roles and states it sets, keys it answers, what it needs from the consumer. Becomes the page's and README's Accessibility section. |
| `@i18n "Key"` | The translation keys the element uses. |
| `@ssr true` / `@ssr false` | Whether the element renders with Lit SSR, optionally with a caveat: `@ssr true - <caveat>`. |

Public statics and `{@link}` in descriptions are handled by `scripts/analyze.ts`; do not annotate around them.

### API design

- Name things after in-repo precedent before external libraries. Grep `bindingDefault`, event names and slot names first.
- The property naming which child, option or slot is shown is `value`, reflected, `bindingDefault: true`, `event: 'change'`, paired with `@event() readonly change`. Boolean toggles use `selected`. Fields bind `value` and fire `input` while editing and `change` on commit.
- Events are camelCase: `<property>Change` for state (`openChange`, `selectionChange`), `request<Verb>` for a cancelable ask the element does not act on itself (`requestSelect`, `requestRemove`). Notify ancestors with an event (`@event({ bubbles: true, composed: true })` across shadow roots), never a callback property; a callback is right only as a directive parameter.
- A custom `converter` delegates to a named parser (`DataGridPagination.from`, `dateTimeConverter`). A value that is scalar or array takes `type: String`, with the array assigned as a property.
- Keep the surface minimal: grep every property across stories, specs, `@3mo/del` consumers and the consuming applications; a member with no consumer and an alternative goes. A boolean that only sets a custom property is not an option. Derive instead of asking. Defer a feature rather than widen the element.
- A boolean attribute on an item must change semantics (role, state, keys, element kind); looks belong to CSS and slots.
- Remove technically public plumbing that no consumer uses outright, without a deprecated alias; keep a `@deprecated` alias only for a released name a consumer still calls.
- Custom element construction is cheap; keep IO out of constructors. Per-item work is not: listeners that every instance adds to `window` or `document` are quadratic to register. Listen on the item, or once for all of them.

### Styling

- Nested CSS inside `css` blocks. Interpolate only `CSSResult` or numbers; wrap enum values in `unsafeCSS`.
- Use the theme tokens from `@3mo/theme` (`--mo-color-*`, `--mo-font-family`, `--mo-border-radius`, `--mo-shadow`, `--mo-duration-quick`) and import `@3mo/theme` in the component. Name new tokens for their role (`--mo-color-selected`), not for how they are mixed. Selected surfaces use `--mo-color-selected` / `--mo-color-on-selected`.
- A shadow `:host` rule loses to any outer declaration, and reflected state attributes let consumers write `mo-chip[selected] { … }`. Publish a custom property only when something inside the shadow root reads it, or when it is one layer of a shorthand a consumer would otherwise restate. Expose inner elements as `part`s.
- `:host(:has(…))` is unsupported, and an invalid selector silently drops the whole rule including its valid neighbours. Compute the condition in the template and stamp an attribute (`data-*`); read slot content with `SlotController`.
- Motion is a CSS-only enhancement: `@starting-style`, `interpolate-size: allow-keywords`, `transition-behavior: allow-discrete`, durations from `--mo-duration-quick` (0s under reduced motion). No JavaScript motion controllers and no keeping elements alive for an exit animation, unless the motion is the pattern itself (a sheet).
- Cross-engine traps: `var()` inside a custom property resolves where the property is declared; reusing an `animation-name` never restarts the animation; `contain: layout`/`paint` and `content-visibility` turn `subgrid` into `none`; a percentage `translate` of a content-sized box retargets mid-flight; container units inside `atan2()` resolve to 1px, so a count cannot come from CSS.
- Never resize the element a `ResizeObserver` watches from its callback; observe a zero-height probe child.

### Accessibility

- Follow the WAI-ARIA Authoring Practices pattern and document it in `@accessibility`. Conventions shared by every widget are in `.storybook/docs/Accessibility.mdx`: one tab stop per composite, roving tabindex (activedescendant only in a combobox), Home/End, PageUp/PageDown, typeahead, arrows swap in right-to-left, disabled items skipped.
- ARIA relations never reach into a descendant shadow root, by IDREF or by element reference. Parts another element must reference are consumer-authored light DOM or live in the same tree (why `mo-tab-panel` is its own element). Prefer reflected element references (`ariaActiveDescendantElement`, `ariaControlsElements`) over IDREFs; generate ids as `` element.id ||= `prefix-${++counter}` `` so a consumer's own id survives.
- Decorative generated content joins the accessible name; write `content: '✓' / ''`.
- Never move focus inside `focus`/`focusin`/`blur`/`focusout` handlers: Blink drops it. Redirect on `pointerdown` with `preventDefault()`, or use roving tabindex.
- `:focus-visible` always matches a focused text input, however it was focused, so it cannot tell pointer from keyboard there. `:focus-within` across shadow roots is unreliable in Firefox; walk `document.activeElement` down through `shadowRoot.activeElement`.
- `pointerover`/`focusout` between items inside a host's own shadow root never reach the host; listen on `host.renderRoot`.
- Material Web wrappers: the 48px touch target of `md-radio`/`md-checkbox` overhangs and steals neighbours' clicks (`touch-target='none'` plus a wrapping `<label>`); an external `tabindex` is sticky and md's own selection controller overwrites it; a disabled `md-*` control stays tabbable; md grouping is scoped to one root and inert inside a wrapper; `md-radio` fires `change` on every click; `input` events are composed and leak out; the button's touch span makes slotted content never the event target.
- Form-associated elements use `@formAssociated` and `FormAssociationController` from `@3mo/element-internals`. The platform caches the form callbacks at `define()`, `attachInternals()` works once (use `elementInternals(element)`), `setValidity` needs a non-empty message, the validity anchor must be a connected descendant, `:user-invalid` never matches, and `disabled`/`readonly` must reflect.

### Localization

- `@3mo/localization` makes `t()` global. The key is the source-language text; typed placeholders (`${count:number}`, `${date:Date}`) format for the language. A package lists its keys in `@i18n` and ships one `translations/<language>.ts` per language, calling `Localizer.dictionaries.add('<language>', { … })` for every key the package itself uses, and exported as `./translations/*` beside `.` in its `package.json`, with the `source`, `types` and `default` conditions. Nothing in the package imports it: applications opt into languages. `packages/DesignLibrary/translations/<language>.ts` imports every package's file of that language as `@3mo/<name>/translations/<language>`, which `translations.test.ts` next to it verifies. Only source-language corrections (plural forms, `✂` abbreviations, disambiguated keys) stay inline as `Localizer.dictionaries.add('en', { … })`. Specs asserting translated text import `./translations/<language>.js`. See `.storybook/docs/Localization.mdx`.
- `t()` is typed `string` but returns a `LocalizedString` object: `typeof t('x') === 'string'` is false. Coerce with `String()`, or test the other member of a union.
- Numbers, dates and lists format with `format()`, `formatAsCurrency()`, `formatAsDate()` and friends for the current language. Use logical properties so right-to-left works.
- Documentation never names specific human languages as examples.

### SSR

- Guard browser-only work with `isServer`; do not touch `document` or `window` at module scope or in constructors.
- The server cannot see light DOM and never commits attribute or text values the browser alone knows, so the client's first render must equal the server's. Keep `@ssr` truthful.

## Writing a controller

- Extend `Controller` from `@a11d/lit`. Take options in the factory form, so the controller lives in a field initializer:

```ts
readonly navigability = new NavigabilityController<Person, NavigableList>(this, host => ({
	items: people,
	get wrap() { return host.wrap },
}))
```

- Implement it as `typeof options === 'function' ? options(host) : options`, with a `THost` generic.
- The host is a structural interface for the state it owns, never DOM. DOM arrives through parts named after the anatomy (`listbox`, `trigger`, `menu`, `dialog`): `ElementRef`/`ElementRefs` used as `${controller.listbox.ref()}` in the template, `.value` to read, `set()`/`delete()` for a host that cannot place a directive. Items register through Indexability's `item({ index, data, disabled })` directive, or imperatively with `setItems` / `addItem` / `deleteItem`; never mix `setItems` with the directive on one controller.
- `ElementRef` lifecycle `updated` fires on every render; wire listeners there only with stable function references. `ElementRefs` iterate in first-declared order, not document order.
- A pattern controller may import primitives and the platform, never a `mo-*` element. Design collaborators arrive through options or cancelable events.
- The controller owns ARIA, `tabindex` and `data-*` on its parts; the template owns everything else. Stamped attributes are public API: assert them in specs.
- Do not build a controller for what the platform provides (a `<button>`).
- Before publishing, cut every option and public member no consumer uses. An option that re-does a composed controller's job is a smell; fold coupled options into one; delete what the platform can compute (direction, the scroll container); keep `disabled` for consistency across the `-ability` family. Behaviour every APG pattern shares is not configurable.
- Holding an `-ability` controller in a field makes a generic component invariant in its item type (`FieldSelect<Person>` stops being `FieldSelect<unknown>`, the type its tag is declared as); `private` does not shield it. Hold it under a narrow structural type naming only the members you drive.
- Claim a key with `preventDefault()` and leave keys whose `defaultPrevented` is set. Global shortcuts claim in the capture phase on `window`.
- A real click runs microtasks between its listeners, so a Lit update can land mid-propagation; synthetic `element.click()` cannot reproduce that. Decide in the capture phase and act in the bubble phase when a click re-renders its own target.
- Document the controller with a short class JSDoc and a usage example, one line per option whose name does not already say it, and an `@accessibility` section for pattern controllers.

## Lit timing traps

- `@property({ updated })` runs in the host's `hostUpdated`, before the children it just wrote to have updated. Anything that needs a child's rendered state (measuring, `scrollIntoView`, focusing into it) hangs off the child's own event, such as `mo-popover`'s `openChange`.
- A `@state()` set inside `updated()` is not part of the pending `updateComplete`.
- `import { type X } from './index.js'` elides the module, so the element never registers. Keep a bare `import './index.js'` wherever registration matters.
- `addInitializer` on a class from another package is order-dependent: subclasses finalized earlier never receive it.
- Under `useDefineForClassFields: false`, a field named after an `HTMLElement` property (`inputMode`) reads the element's own value instead of `undefined`.
- An element that sets an attribute in its constructor or a field initializer (`override role = 'listitem'`) throws from `document.createElement`; build such elements from a Lit template or parsed markup.

## Stories and docs

The full rules are in `.storybook/docs/WritingStories.mdx` (Contributing / Writing Stories). The essentials:

- `export default { title: 'Actions / Button', component: 'mo-button', args, argTypes } satisfies Meta<Args>`. Sections, in sidebar order: Getting Started, Foundations, Actions, Inputs, Layout, Feedback, Data, Behaviors, Utilities, Recipes, Contributing. `tags: ['status:preview']` marks an API that may still change.
- `Default` comes first: the simplest self-contained use, with its controls. Its template is also the README's Usage, so it references nothing defined elsewhere in the file. Then one story per aspect, named after it: `Types`, `Disabled`, `Icons`, `Slots`, `Overflow`, `CustomProperties`, `Parts`.
- One or two lines of JSDoc above each story say what it shows and what to try. No prose inside templates.
- Only args a story declares get a control; declare one only when changing it teaches something. `render` destructures its args: `render: ({ type, disabled }) => …`.
- Show code: an attribute-only template shows its rendered HTML; one with property or event bindings or directives shows as written, so write it the way a consumer would. Layout wrappers go in `decorators`, which the code omits.
- A dialog, sheet, drawer or menu never opens by itself: render the trigger that opens it.
- A controller's demo is a component in the package's `stories/` folder, named `story-*` (unique repo-wide: a duplicate define breaks the smoke test), shown with `parameters: sourceOf(source)` from `.storybook/source.js` and a `?raw` import. Never declare a demo tag in `HTMLElementTagNameMap`. A Behaviors page shows its controller's `@accessibility` once its meta has `parameters: { controller: 'ListboxController' }`.
- Sample data comes from the root `stories/` folder. Sample people are the fictional characters there.
- State: `useState`/`useArgs` from `storybook/preview-api`. Every manifest event appears in the Actions panel by itself; for a native event pass an `fn()` arg from `storybook/test`. Theme and language are toolbar switches, so no dark or right-to-left variants.
- Stories may use any `mo-*` element without importing it, because `preview.ts` imports `@3mo/del`; import the package's own `./index.js`.
- A component that needs explaining gets an attached `<Name>.mdx` (`<Meta of={Stories} />`) composing `Hero`, `Install`, `Playground`, short sections with `<DocsStory of={…} />`, then `Accessibility`, `Api`, `Changelog` from `.storybook/blocks`; `packages/DataGrid/DataGrid.mdx` is the model. MDX has no Markdown tables, and code fences use `bash`, not `sh`. Each block goes on one line of its own, and `scripts/util/DocsPage.ts` must know it, or the docs build fails.
- Docs links are `?path=/docs/<section>-<name>--overview`.

## Specs

- Specs are `*.test.ts` next to the source, using Vitest globals (`describe`, `it`, `expect`, `vi`).
- **File structure:**
  - One test file per class or controller (`<Name>.test.ts` next to `<Name>.ts`).
  - For complex components with sub-elements, columns, or controllers, split tests into dedicated files and subdirectories matching source layout (e.g. `<Component>Controller.test.ts`, `columns/<Column>.test.ts`) rather than a single monolithic file.
- **Suite hierarchy:**
  - Top level: Class name (`describe('DataGrid', () => { ... })`).
  - Second level: Feature or capability (`describe('Selection', ...)`, `describe('Pagination', ...)`), never raw property names.
  - Third level: Scenario or state (`describe('when disabled', ...)`, `describe('with slotted items', ...)`).
  - Leaf: Behaviour-first expectation (`it('should preserve selection when items reorder', async () => { ... })`).
- **Fixture isolation:**
  - Scope `new ComponentTestFixture<Button>('mo-button')` (or a template/factory from `@a11d/lit-testing`) inside the relevant feature or scenario `describe` block—not as a single global at the file root. Each scenario should own its template and state so tests never bleed mutations across each other. `await fixture.update()` / `fixture.updateComplete`. Import `./index.js` for registration.
- **Test harnesses:**
  - When testing protected members, mock data, or composition, define a minimal test subclass/harness (`Test<Component> extends <Component>`) and register it under a custom tag (`customElements.define('test-...', ...)`).
- Specs and stories are type-checked by `packages/tsconfig.json` in `npm run typescript`. Use `component.shadowRoot!.activeElement`; `renderRoot` has no `activeElement`.
- Vitest config that matters: hooks run in registration order (`sequence.hooks: 'list'`), mocks restore after each spec, the viewport is 1280×800.
- Vitest traps: a function returned from a hook is a teardown (`beforeEach(() => x = fn)` hands one back); `vi.spyOn` calls through, so add `.mockReturnValue(…)` to stub; `vi.fn(impl)` survives restores, `mockImplementation` does not; skipping at runtime is `context.skip()`; unhandled rejections fail the run.
- Headless Firefox raises no focus events for programmatic `focus()` while the document is unfocused: dispatch the `focusin` yourself. Send keys where real ones arrive (the focused element, or `window` for global shortcuts).
- Synthetic pointer events start wherever the spec dispatches them, so hit-testing bugs pass. Use `userEvent` from `vitest/browser` for real input, give synthetic events realistic fields (`isPrimary`, `buttons`, `relatedTarget`, samples spaced like real input), and prove a guard by injecting the bug and watching the spec fail.
- Behaviour a popover also provides (focus return, dismissal) needs a popover-free fixture, or the popover masks a broken controller.
- Never assert mid-transition state: set `element.style.transition = 'none'` or shorten the duration through its custom property, then assert the settled result. Poll for the condition or await the event rather than sleeping a fixed time.
- No vacuous assertions: `expect(templateResult).toBeDefined()` cannot fail; render the template and assert its content. Lit's comment markers appear in `textContent` of a container's child nodes.
- Specs driven by timers, idle callbacks, animation frames or drags can fail on a loaded machine (Storybook running alongside, a full run). Before blaming your change, run the failing file alone and against a clean checkout of `main`, several times, and compare failure rates.

## Code style

- Tabs, LF, no final newline (`.editorconfig`, and `@stylistic/js/eol-last: never` in lint). Single quotes, no semicolons, `1tbs` braces, no `public` keyword, `import { type X }` for types, no `console`. Attribute values in templates use single quotes.
- `@html-eslint` checks `html` templates, including `use-baseline`: a non-Baseline attribute (`popover`) fails; bind it as a property.
- Relative imports carry the `.js` extension.
- Comments: the class JSDoc header in full, one line per public option or member where the name does not say it. Inside methods and `css` blocks, a comment only where a reader would otherwise undo the line, in one line. No narration, no history of how the code came about. Trim existing narration in files you touch.
- Prefer deleting machinery to adding it, and fix root causes in the base class over mitigations in subclasses.
- Scripts that rewrite files on Windows must keep LF and add no final newline.

## Commits, changelogs and releases

- Conventional commits: `feat(Button): Add the selectable button component`. The scope is the package's directory name, exactly; the subject is capitalized, code in backticks, `!` marks a breaking change (`feat(Chip)!: …`). Types: `feat`, `fix`, `chore`, `refactor`, `perf`, `test`, `docs`, `infra`.
- `scripts/changelog.ts` reads the first-parent history of `main` for commits that changed `packages/<Name>/package.json` and keeps their changes whose scope equals `<Name>`. A wrong or misspelled scope, or a change that does not touch the package's `package.json` (its version), means no changelog entry. The changelog is generated, never committed; put release notes in the commit body.
- A version is bumped in the commit that makes the change, with `npm run bump`. A change a dependent needs bumps the dependent in the same push and raises its floor (`">=0.6.0"`). A prerelease satisfies no range but a floor naming a prerelease, so `npm run bump` raises every workspace dependent of a prerelease to `">=<version>"`, or the workspace would not install. Version bumps and dependency floors are the maintainer's decision; do not bump versions unless asked.
- `npm run release` publishes what `main` holds: every package whose version npm does not have yet. It refuses anything but a clean checkout of `main` at `origin/main`, orders the packages by their `@3mo/*` dependencies and peer dependencies (bases first), builds them, writes their manifests and changelogs into the packages so the tarballs ship them, and publishes, prereleases under the `preview` tag. It commits, tags and creates nothing on GitHub, and a rerun skips what is already published, so a failed release is finished by running it again. It warns about packages whose shipped files changed since their published version was built (npm's `gitHead`, or the commit that set the version) without a bump: those changes are not published until a bump.
- Every push to `main` publishes through the `Release` job of `development.yml`, with npm trusted publishing: npm trusts that workflow file in the GitHub environment `npm`, which only `main` may deploy to, so there is no token or secret. Each package has its own trust rule, and `npm trust` only accepts packages that already exist on npm. A new package is therefore published once by hand (`npm run release` from a clean `main`), then trusted with `npm trust github <@3mo/name> --file development.yml --repo 3mo-esolutions/web-components --env npm --allow-publish`. Renaming the workflow or the environment breaks every rule.
- On `main`, the pre-commit hook regenerates the root README.

## Verification before calling work done

| Change | Checks |
| --- | --- |
| Component or controller source | Its spec files in Chromium, then Firefox; its consumers' specs if the change reaches them; `npm run typescript`; eslint on the changed files; the stories in Storybook. |
| Specs or stories only | The affected spec files; `npm run typescript` (it covers specs and stories); the smoke test for changed stories. |
| JSDoc, `package.json`, stories | `npm run analyze`, `npm run readme -- <package>`, and a look at the docs page. |
| New package | All of the above, plus the root `tsconfig.json` reference and the `@3mo/del` entries. |
| Before opening a PR or handing over a branch | `npm test` once. |

- Before diagnosing, establish which code is actually running: which file versions are live and what imports what. Reproduce the exact symptom, prove the fix in the browser, and revert speculative changes made while chasing the wrong cause. Stated causes need evidence.
- Look at the result in Storybook on a free port: `iframe.html?id=<story-id>&viewMode=story` renders a story alone.
- For real input, geometry, animations, accessibility trees or timing, script headless Playwright from the repository root (`import { chromium, firefox } from 'playwright'`) against a Storybook story. For the accessibility tree use CDP `Accessibility.getFullAXTree`. Prefer counts over timings when turning a probe into a spec.

## Workflow guidelines

- Run only the affected tests or package during development; the full test suite contains many tests, runs several minutes, and is resource-intensive.
- Before removing public members, search across all packages and consuming applications. Report every technically breaking removal in the final summary.
- Keep diffs minimal and focused: avoid speculative refactors or changes unrelated to the task.