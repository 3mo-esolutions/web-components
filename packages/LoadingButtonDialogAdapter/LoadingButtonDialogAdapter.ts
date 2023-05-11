import { Dialog } from '@3mo/dialog'
import { LoadingButton } from '@3mo/loading-button'

Dialog.executingActionAdaptersByComponent.set(LoadingButton, (button, isExecuting) => {
	(button as LoadingButton).loading = isExecuting
})