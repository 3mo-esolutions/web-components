/* eslint-disable */
// @ts-check
import { Arguments, Packages, run } from './util/index.mjs'

const packageName = Arguments.tryGet(0, 'No package provided')
const versionBumpType = Arguments.tryGet(1, 'No version bump type provided')

const packageDirectory = Packages.getDirectory(packageName)

await run('npm run clean')
await run(`tsc`, packageDirectory)
await run(`webpack --config ../../webpack.config.mjs`, packageDirectory)
await run(`npm version --loglevel=error ${versionBumpType}`, packageDirectory)
await run('npm publish --loglevel=error --access public', packageDirectory)
await run('npm run clean')