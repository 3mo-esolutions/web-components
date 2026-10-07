# Localization

Utilities for localization: typed translation keys with plurals, and locale-aware number, date and currency formatting.

[![npm](https://img.shields.io/npm/v/@3mo/localization?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/localization) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-localization--overview)

## Installation

```sh
npm install @3mo/localization
```

```ts
import { Localizer } from '@3mo/localization'
```

## Usage

```html
<mo-flex gap='16px' style='max-width: 360px'>
	<mo-flex direction='horizontal' gap='20px'>
		<mo-anchor>${t('Home')}</mo-anchor>
		<mo-anchor>${t('Inbox (${count:number})', { count })}</mo-anchor>
	</mo-flex>
	<mo-field-number label=${t('Count')} .value=${count} @change=${(event: CustomEvent<number | undefined>) => setCount(event.detail ?? 0)}></mo-field-number>
	<span>${t('You have ${count:pluralityNumber} new messages', { count })}</span>
	<span style='opacity: 0.5'>${t('Updated on ${date:Date}', { date: new Date() })}</span>
</mo-flex>
```

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Localizer` | class |  |
| `DirectionsByLanguage` | class | Provides direction for a given language code. |
| `LocalizableString` | class |  |
| `LocalizedString` | class |  |
| `LocalizerController` | class |  |
| `Currency` | class |  |
| `extractDateTimeFormatOptions` | function |  |
| `extractFormatOptions` | function |  |
| `getDateTimeFormatter` | const | Constructing a formatter costs far more than using one, so they are kept and reused. |
| `Locale` | type | A locale identifier such as `de` or `de-CH`, as a tag or an `Intl.Locale`. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-localization--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/foundations-localization--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/localization)

## License

MIT © 3MO GmbH
