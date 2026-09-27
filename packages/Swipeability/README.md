# Swipeability

A Lit controller for surfaces swiped along one axis between rest positions, yielding to content that scrolls.

[![npm](https://img.shields.io/npm/v/@3mo/swipeability?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/swipeability) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-swipeability--overview)

## Installation

```sh
npm install @3mo/swipeability
```

```ts
import { SwipeabilityController } from '@3mo/swipeability'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-swipeability--default) — Swipe the card towards the end: past a quarter of the way, or with a flick, it settles at the far detent and is gone.
- [Swipe To Reveal Actions](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-swipeability--swipe-to-reveal-actions) — Swipe the row towards the start: it parks at the width of the actions behind it, and swipes back to close.
- [Multiple Detents](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-swipeability--multiple-detents) — Drag the panel up and down: it peeks, half-opens and fills, moving one detent per gesture.
- [Scroll Deference](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-swipeability--scroll-deference) — Drag inside the box and it scrolls instead of the card - until it reaches its top, when the gesture becomes the card's again.
- [Pull To Act](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-swipeability--pull-to-act) — Reaching a detent need not park the surface there: pulled all the way down, it refreshes and springs back.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `SwipeabilityController` | class | Drags a surface along one axis between rest positions, called detents. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-swipeability--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-swipeability--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Swipeability)

## License

MIT © 3MO GmbH