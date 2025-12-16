import { execa } from 'execa'

export async function run(command: string, options?: { directory?: string, reject?: boolean, captureOutput?: boolean }): Promise<string> {
	try {
		const { all, stdout } = await execa(command, {
			cwd: options?.directory,
			shell: true,
			reject: !options?.reject,
			all: options?.captureOutput ? true : undefined,
			stdio: options?.captureOutput ? undefined : 'inherit'
		})
		return !options?.captureOutput ? '' : (all ?? stdout)?.toString() ?? ''
	} catch (error) {
		if (options?.reject) {
			return ''
		}
		throw error
	}
}