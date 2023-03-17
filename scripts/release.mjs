// @ts-check
import { Arguments, Packages } from './util/index.mjs'

const packageName = Arguments.tryGet(0, 'No package provided')
const versionBumpType = Arguments.tryGet(1, 'No version bump type provided')

await Packages.release(packageName, versionBumpType)