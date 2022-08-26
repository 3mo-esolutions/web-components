/* eslint-disable no-console */
import { exec } from 'child_process'
import { promisify } from 'util'

export async function run(command, directory) {
	const { stdout, stderr } = await promisify(exec)(command, { cwd: directory })
	if (stderr) {
		throw new Error(stderr)
	}
	console.log(stdout)
}