# Instanceof Attribute Controller

A Lit controller for an instanceof attribute that lists the tag names of an element's class and its ancestors, for CSS.

[![npm](https://img.shields.io/npm/v/@3mo/instanceof-attribute-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/instanceof-attribute-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-instanceof-attribute-controller--overview)

## Installation

```sh
npm install @3mo/instanceof-attribute-controller
```

```ts
import { InstanceofAttributeController } from '@3mo/instanceof-attribute-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-instanceof-attribute-controller--default) — The attribute lists the tag of the element's class and of every custom element class it extends.
- [Selector](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-instanceof-attribute-controller--selector) — `[instanceof~=story-badge]` matches the badge and every subclass, where a tag selector matches only one.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `InstanceofAttributeController` | class | A controller that writes the tags of its host's class and of every custom element class it extends into an `instanceof` attribute, so selectors can match subclasses. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-instanceof-attribute-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-instanceof-attribute-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/InstanceofAttributeController)

## License

MIT © 3MO GmbH