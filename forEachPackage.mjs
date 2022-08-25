/* eslint-disable */
// @ts-check
import { exec } from 'child_process'
import { existsSync, readdirSync, stat, statSync} from 'fs'

const [command] = process.argv.slice(2)

if (!command) {
	console.error('No command provided')
	process.exit(1)
}

const packagesDirectory = './packages'
const subPackagesDirectories = readdirSync(packagesDirectory)
	.filter(file => statSync(`${packagesDirectory}/${file}`).isDirectory())
	.filter(directory => existsSync(`${packagesDirectory}/${directory}/package.json`))

for (const directory of subPackagesDirectories) {
	exec(
		`npm ${command}`,
		{ cwd: `${packagesDirectory}/${directory}` },
		(_, stdout) => console.log(stdout),
	)
}