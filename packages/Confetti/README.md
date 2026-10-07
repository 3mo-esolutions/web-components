# Confetti

A web component for confetti bursts that rain over the page, drawn on a canvas.

[![npm](https://img.shields.io/npm/v/@3mo/confetti?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/confetti) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-confetti--overview)

A canvas that rains a burst of confetti over its nearest positioned ancestor when `rain()` is called.

## Installation

```sh
npm install @3mo/confetti
```

```ts
import '@3mo/confetti'
```

## Usage

```html
<mo-button type='filled' startIcon='celebration' @click=${() => document.querySelector('mo-confetti')?.rain()}>Celebrate</mo-button>
<mo-confetti></mo-confetti>
```

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-confetti--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/feedback-confetti--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Confetti)

## License

MIT © 3MO GmbH
