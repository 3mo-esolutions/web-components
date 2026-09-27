# Pointer Controller

Lit controllers for pointer hover, press and type, and for turning presses into drags and held repeats.

[![npm](https://img.shields.io/npm/v/@3mo/pointer-controller?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/pointer-controller) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-pointer-controller--overview)

## Installation

```sh
npm install @3mo/pointer-controller
```

```ts
import {
	PointerDragController,
	PointerHoverController,
	PointerRepeatController,
	PointerController,
} from '@3mo/pointer-controller'
```

## Examples

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-controller--default) — Hover and press the area with a mouse, a pen or a finger: it reports all three.
- [Hover Under Layout Shift](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-controller--hover-under-layout-shift) — Hover follows the boundary events, which also fire when the layout moves the box under a resting pointer - rest it where the box's edge passes.

### Pointer Drag Controller

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-drag-controller--default) — A press becomes a drag once it has travelled 4px, so a click still counts - and dropping the card never clicks it.
- [Resize Handle](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-drag-controller--resize-handle) — With `threshold: 0` the press itself is the drag, captured at once, so the handle keeps following outside the frame.
- [Along One Axis](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-drag-controller--along-one-axis) — `isDrag` is asked on a press's first movement: sideways slides a row open to its action, up or down leaves the list to scroll.

### Pointer Repeat Controller

- [Default](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-repeat-controller--default) — Hold + down: after 500ms it keeps stepping.
- [Press Only](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-repeat-controller--press-only) — Ignoring the repetitions, a held pointer steps once - while a held Enter still repeats.
- [Acceleration](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-repeat-controller--acceleration) — The trigger receives the number of triggers before it, so a long hold can widen the step from 1 to 10 to 100 - the policy is the consumer's.
- [Stopping At A Bound](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-repeat-controller--stopping-at-a-bound) — Hold + past 10: `stop()` ends the repetition at the bound while the press is still down, so nothing keeps firing into the clamp.
- [Timing](https://3mo-esolutions.github.io/web-components/?path=/story/behaviors-pointer-repeat-controller--timing) — `delay` and `interval` are options, so a coarse control can be deliberate and a fine one brisk.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `PointerDragController` | class | Turns a press on an element into a drag once it travels far enough, or once a touch is held long enough. |
| `PointerHoverController` | class | Tracks whether a pointer hovers the host from the boundary events, which also fire when the layout moves under a resting pointer. |
| `PointerPressController` | class | Tracks whether a pointer is pressed on the host, until it is released anywhere. |
| `PointerRepeatController` | class | Repeats a trigger while a pointer is held down, as a held key repeats on its own. |
| `PointerTypeController` | class | Tracks which kind of pointer - mouse, touch or pen - the user last used anywhere in the document. |
| `PointerController` | class | Tracks whether a pointer hovers or presses the host, and which kind of pointer the user last used. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-pointer-controller--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/behaviors-pointer-controller--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/PointerController)

## License

MIT © 3MO GmbH