import { component, html, Component, state, query, css } from '@a11d/lit'

class ConfettiParticle {
	constructor(
		private context: CanvasRenderingContext2D,
		public width: number,
		public height: number,
		private readonly lightness = 50,
		private readonly diameter = Math.random() * 6 + 4,
		private tilt = 0,
		private readonly tiltAngleIncrement = Math.random() * 0.1 + 0.04,
		private tiltAngle = 0,
		private readonly particleSpeed = window.innerHeight * 0.01,
		private waveAngle = 0,
		private x = 0,
		private y = 0,
		private readonly color = Math.floor(Math.random() * 360)
	) {
		this.reset()
	}

	reset() {
		this.x = Math.random() * this.width
		this.y = Math.random() * this.height - this.height
	}

	update() {
		this.waveAngle += this.tiltAngleIncrement
		this.tiltAngle += this.tiltAngleIncrement
		this.tilt = Math.sin(this.tiltAngle) * 12
		this.x += Math.sin(this.waveAngle)
		this.y += (Math.cos(this.waveAngle) + this.diameter + this.particleSpeed) * 0.4
	}

	draw() {
		const x = this.x + this.tilt
		this.context.beginPath()
		this.context.lineWidth = this.diameter
		this.context.strokeStyle = `hsl(${this.color}, 50%, ${this.lightness}%)`
		this.context.moveTo(x + this.diameter / 2, this.y)
		this.context.lineTo(x, this.y + this.tilt + this.diameter / 2)
		this.context.stroke()
	}

	get isFinished() {
		return (this.y > this.height + 20)
	}
}

@component('mo-confetti')
export class Confetti extends Component {
	@state() private canvasWidth = 0
	@state() private canvasHeight = 0

	@query('canvas') private readonly canvasParticle!: HTMLCanvasElement

	async rain() {
		const animate = () => {
			requestAnimationFrame(animate)
			this.canvasParticleContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

			for (const particle of particles) {
				particle.width = this.canvasWidth
				particle.height = this.canvasHeight
				particle.update()
				particle.draw()
			}
		}

		this.hidden = false
		this.canvasWidth = window.innerWidth
		this.canvasHeight = window.innerHeight

		const particles = Array<ConfettiParticle>()
		const totalParticleCount = Math.round(this.canvasWidth / 2.5)
		for (let i = 0; i < totalParticleCount; ++i) {
			particles.push(new ConfettiParticle(this.canvasParticleContext, this.canvasWidth, this.canvasHeight))
		}

		animate()

		while (particles.every(p => p.isFinished) === false) {
			await new Promise(resolve => setTimeout(resolve, 500))
		}

		this.hidden = true
	}

	private get canvasParticleContext() { return this.canvasParticle.getContext('2d') as CanvasRenderingContext2D }

	protected override initialized() {
		this.hidden = true
	}

	static override get styles() {
		return css`
			:host {
				z-index: 11;
				top: 0;
				width: 100%;
				height: 100%;
				position: absolute;
			}

			canvas {
				width: 100%;
				height: 100%;
				position: absolute;
			}
		`
	}

	protected override get template() {
		return html`<canvas width=${this.canvasWidth} height=${this.canvasHeight}></canvas>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'mo-confetti': Confetti
	}
}