# Language Field

A web component for multilingual fields holding one value per language, with a language picker and an all-languages dialog.

[![npm](https://img.shields.io/npm/v/@3mo/language-field?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/language-field) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-language-field--overview)

## Installation

```sh
npm install @3mo/language-field
```

```ts
import { LanguageField } from '@3mo/language-field'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-language-field--default) — A `LanguageField` subclass fetches the languages; `fieldTemplate` renders the field for the selected one.
- [Overlay](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-language-field--overlay) — `mode='overlay'` lays the language selector over the field's top corner, which suits a text area.
- [Dense](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-language-field--dense) — `dense` makes the language selector dense, to match a dense field.
- [Option Template](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-language-field--option-template) — `optionTemplate` renders each language in the selector.
- [Single Language](https://3mo-esolutions.github.io/web-components/?path=/story/inputs-language-field--single-language) — With a single language there is nothing to choose, so the field is rendered alone.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `DialogLanguageField` | class |  |
| `LanguageField` | class | The base of a field that holds one value per language, with a language selector attached; subclasses fetch the languages. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-language-field--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/inputs-language-field--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/LanguageField)

## License

MIT © 3MO GmbH