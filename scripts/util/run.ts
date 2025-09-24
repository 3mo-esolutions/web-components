import { exec } from 'child_process'
import { promisify } from 'util'

/** Runs a command in a directory and returns the stdout */
export async function run(command: string, directory?: string, noError = false) {
	const { stdout, stderr } = await promisify(exec)(command, { cwd: directory })
	if (stderr && !noError) {
		throw new Error(stderr)
	}
	return stdout
}