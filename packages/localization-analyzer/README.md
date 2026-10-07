# Localization Analyzer

A Node tool for finding missing and unused translations per language by comparing an app bundle with its dictionaries.

[![npm](https://img.shields.io/npm/v/@3mo/localization-analyzer?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/localization-analyzer)

## Installation

```sh
npm install @3mo/localization-analyzer
```

```ts
import {
	extractUsedLocalizationKeys,
	getLocalizationDictionaries,
	analyze,
} from '@3mo/localization-analyzer'
```

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `extractUsedLocalizationKeys` | function | Extracts the localization keys used in the given code. |
| `getLocalizationDictionaries` | function | Gets the localization dictionaries from a running application server. |
| `analyze` | function | Analyzes the localization of a running application server. |

## Links

- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/localization-analyzer)

## License

MIT © 3MO GmbH
