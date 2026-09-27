# Keyboard Controller

A utility for tracking globally whether Ctrl, Shift, Alt or Meta is held down.

[![npm](https://img.shields.io/npm/v/@3mo/keyboard-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/keyboard-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-keyboard-controller--overview)

## Installation

```sh
npm install @3mo/keyboard-controller
```

```ts
import { KeyboardController } from '@3mo/keyboard-controller'
```

## Usage

```html
<mo-flex direction='horizontal' gap='16px' alignItems='center'>
	<mo-button type='outlined' @click=${() => setModifiers([
		KeyboardController.ctrl && 'Ctrl',
		KeyboardController.shift && 'Shift',
		KeyboardController.alt && 'Alt',
		KeyboardController.meta && 'Meta',
	].filter(Boolean).join(' + ') || 'None')}>Click</mo-button>
	<span>${modifiers}</span>
</mo-flex>
```

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `KeyboardController` | class | Tracks globally whether Ctrl, Shift, Alt or Meta is held down, for code that has no keyboard event at hand. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-keyboard-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-keyboard-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/KeyboardController)

## License

MIT © 3MO GmbH