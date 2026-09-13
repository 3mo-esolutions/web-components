/**
 * How a set of navigations is presented:
 * - `bar` — a horizontal row in the application's header, groups opening as dropdowns.
 * - `rail` — a vertical strip at the leading edge, a group's children shown in a panel beside it.
 * - `drawer` — a modal panel over the page, holding every navigation as a tree.
 */
export type NavigationPresentation = 'bar' | 'rail' | 'drawer'