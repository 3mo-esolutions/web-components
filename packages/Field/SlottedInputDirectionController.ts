import { Controller, type ReactiveControllerHost } from '@a11d/lit'

export class SlottedInputDirectionController extends Controller {
	private readonly attributeObserver = new MutationObserver(() => this.synchronize())
	private input?: Element

	constructor(
		protected override readonly host: ReactiveControllerHost & HTMLElement,
		private readonly getInput: () => Element | undefined,
	) {
		super(host)
	}

	observe() {
		this.attributeObserver.disconnect()
		const input = this.input = this.getInput()
		if (input) {
			input.setAttribute('dir', input.getAttribute('dir') ?? 'auto')
			this.attributeObserver.observe(input, { attributeFilter: ['dir'] })
			input.addEventListener('input', this.synchronize)
			this.synchronize()
		}
	}

	disconnect() {
		this.attributeObserver.disconnect()
	}

	readonly synchronize = () => {
		this.host.dir = this.input?.matches(':dir(rtl)') ? 'rtl' : ''
	}
}
