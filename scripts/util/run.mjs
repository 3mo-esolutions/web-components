/* eslint-disable no-console */
import { exec } from 'child_process'
import { promisify } from 'util'

/**
 * Runs a command in a directory and returns the stdout
 * @param {string} command - The command to run
 * @param {string | undefined} directory - The directory to run the command in
 */
export async function run(command, directory = undefined, noError = false) {
	const { stdout, stderr } = await promisify(exec)(command, { cwd: directory })
	if (stderr && !noError) {
		throw new Error(stderr)
	}
	return stdout
}