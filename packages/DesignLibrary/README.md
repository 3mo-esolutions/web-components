# Design Library

A bundle of the whole library, re-exported with Lit and the application framework, plus a business-suite app shell.

[![npm](https://img.shields.io/npm/v/@3mo/del?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/del) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-introduction--overview)

`mo-avatar` — A circle in the accent color holding initials or an icon, such as a person's.

`mo-user-avatar` — The signed-in user's initials, which open a menu with their name, their email and menu items of your own.

## Installation

```sh
npm install @3mo/del
```

```ts
import '@3mo/del'
```

## Usage

```html
<mo-avatar>AZ</mo-avatar>
```

## Examples

- [Icon](https://3mo-esolutions.github.io/web-components/?path=/story/data-avatar--icon) — An icon takes the place of the initials, for someone unknown or for a group.
- [Sizes](https://3mo-esolutions.github.io/web-components/?path=/story/data-avatar--sizes) — The circle is 40px by default; its own `width`, `height` and `font-size` resize it.
- [Colors](https://3mo-esolutions.github.io/web-components/?path=/story/data-avatar--colors) — The accent color fills the circle unless its own `background` and `color` replace it.

### User Avatar

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/data-user-avatar--default)
- [Without Email](https://3mo-esolutions.github.io/web-components/?path=/story/data-user-avatar--without-email) — Without `email`, the menu shows only the name above its items.
- [Unauthenticated](https://3mo-esolutions.github.io/web-components/?path=/story/data-user-avatar--unauthenticated) — Without a `name` nobody is signed in: the avatar shows an account button, which opens the application's sign-in if it has one.

## API

### `mo-avatar`

#### Slots

| Name | Description |
| --- | --- |
| (default) | The initials or icon. |

### `mo-user-avatar`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` | Whether the menu is open. |
| `name` | `name` | `string \| undefined` |  | The user's full name, whose first and last initials the avatar shows. Without it, nobody is signed in. |
| `email` | `email` | `string \| undefined` |  | The email shown under the name in the menu. |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `openChange` | `boolean` | Whether the menu is open, whenever that changes. |

#### Slots

| Name | Description |
| --- | --- |
| (default) | Menu items, shown below the user and above the sign-out item that an application with an authenticator adds. |

### `mo-application-logo`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `source` | `source` | `string \| undefined` | `"ApplicationLogo.source"` |

### `mo-business-suite-authentication-dialog`

#### Properties

| Name | Attribute | Type | Default |
| --- | --- | --- | --- |
| `open` | `open` | `boolean` | `false` |
| `heading` | `heading` | `string` | `""` |

### `mo-field-net-gross-currency`

#### Properties

| Name | Attribute | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `isGross` | `isGross` | `boolean` | `false` |  |
| `currency` | `currency` | `Currency` | `"EUR"` |  |
| `currencySymbol` | `currencySymbol` | `string \| undefined` |  |  |
| `selectOnFocus` | `selectOnFocus` | `boolean` | `false` | Selects the input text when the field receives focus. |
| `dense` | `dense` | `boolean` | `false` | Whether the field is dense |
| `value` | `value` | `NetGrossCurrency` | `["undefined",false]` | The field's value |
| `label` | `label` | `string` | `""` | The field's label |
| `readonly` | `readonly` | `boolean` | `false` | Whether the field is readonly |
| `disabled` | `disabled` | `boolean` | `false` | Whether the field is disabled |
| `required` | `required` | `boolean` | `false` | Whether the field is required |

#### Events

| Name | Detail | Description |
| --- | --- | --- |
| `change` | `T \| undefined` | Dispatched with the value when the user commits it |
| `input` | `T \| undefined` | Dispatched with the value while the user edits it |
| `validityChange` | `boolean` | Dispatched with whether the value is valid, after every validation |

#### Slots

| Name | Description |
| --- | --- |
| (default) | The field's content |
| `start` | Content to be placed at the start of the field |
| `end` | Content to be placed at the end of the field |

#### CSS parts

| Name | Description |
| --- | --- |
| `input` | The input element. |
| `container` | Field's container |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-introduction--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/getting-started-introduction--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/DesignLibrary)

## License

MIT © 3MO GmbH
