# Throttler

A utility for throttling bursts of async calls, letting the first through at once and the last after a quiet delay.

[![npm](https://img.shields.io/npm/v/@3mo/throttler?style=flat-square&color=0077c8)](https://www.npmjs.com/package/@3mo/throttler) [![Documentation](https://img.shields.io/badge/docs-storybook-ff4785?style=flat-square&logo=storybook&logoColor=white)](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-throttler--overview)

## Installation

```sh
npm install @3mo/throttler
```

```ts
import { Throttler } from '@3mo/throttler'
```

## Usage

```html
<mo-button type='outlined' @click=${async () => {
	setClicks(count => count + 1)
	await throttler.throttle()
	setSaves(count => count + 1)
}}>Save</mo-button>
<span>${clicks} clicks, ${saves} saves</span>
```

## Examples

- [Typing](https://3mo-esolutions.github.io/web-components/?path=/story/utilities-throttler--typing) — Throttling keystrokes searches for the first one right away and for the final text once typing pauses.

## API

### Exports

| Name | Kind | Description |
| --- | --- | --- |
| `Throttler` | class | Throttles a burst of calls to `throttle()`: the first resolves at once and the last once the delay has passed without another call. |

## Links

- [Documentation](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-throttler--overview)
- [Changelog](https://3mo-esolutions.github.io/web-components/?path=/docs/utilities-throttler--overview)
- [Source](https://github.com/3mo-esolutions/web-components/tree/main/packages/Throttler)

## License

MIT © 3MO GmbH