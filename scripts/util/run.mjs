/* eslint-disable no-console */
import { exec } from 'child_process'

export function run(command, directory) {
	return new Promise(resolve => {
		exec(command, { cwd: directory }, (_, stdout) => {
			console.log(stdout)
			resolve()
		})
	})
}