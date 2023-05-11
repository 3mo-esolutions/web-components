import { Dialog } from '@3mo/dialog'
import { SplitButton } from '@3mo/split-button'

Dialog.executingActionAdaptersByComponent.set(SplitButton, (button, isExecuting) => {
	const Constructor = button.firstElementChild?.constructor as Constructor<HTMLElement> | undefined
	if (Constructor) {
		Dialog.executingActionAdaptersByComponent.get(Constructor)
			?.(button.firstElementChild as HTMLElement, isExecuting)
	}
})