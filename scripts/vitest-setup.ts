// Lit announces dev mode once per page, and every spec file gets its own — hundreds of identical
// banners. Seeding the set it deduplicates against retires the notice without hiding anything else.
const lit = globalThis as { litIssuedWarnings?: Set<string> }
lit.litIssuedWarnings ??= new Set()
lit.litIssuedWarnings.add('dev-mode')