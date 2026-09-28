/// <reference lib="dom" />
// Imported before any other module of a hydration page, since defining a component upgrades its
// server-rendered elements while the modules are still being evaluated.
export const errors = new Array<string>()
window.addEventListener('error', event => errors.push(String(event.error?.message ?? event.message)))
window.addEventListener('unhandledrejection', event => errors.push(String(event.reason?.message ?? event.reason)))