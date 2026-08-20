import { Controller } from '@a11d/lit'
import { type InteractivePdf } from './InteractivePdf.js'
import * as fabric from 'fabric'

type FabricEvent = { target: fabric.FabricObject }

export enum FabricMode { Brush, Text, Picture }

class PictureReader {
  read(): Promise<fabric.FabricImage | null> {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    return new Promise((resolve) => {
      input.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.item(0)
        const reader = new FileReader()
        reader.addEventListener('load', (e) => {
          const image = new Image()
          image.addEventListener('load', () => {
            resolve(
              new fabric.FabricImage(image, { left: 100, top: 100, angle: 0, opacity: 1 })
            )
          })
          image.addEventListener('error', () => resolve(null))
          image.src = e.target!.result as string
        })
        reader.readAsDataURL(file!)
      })

      input.click()
    })
  }
}

export class FabricController extends Controller {
  override host!: InteractivePdf

  private fabricNodes = new Array<fabric.Canvas>()

  brush = {
    color: 'black',
  }

  fontStyle: Partial<fabric.ITextProps> = {
    fontFamily: 'Arial',
    fill: 'black',
    fontSize: 20,
  }

  private _mode?: FabricMode

  get mode() {
    return this._mode
  }

  set mode(value) {
    this._mode = value
    this.host.requestUpdate()
  }

  render() {
    this.fabricNodes = this.host.fabricNodes.map((fabricNode, i) => {
      const { clientWidth, clientHeight } = this.host.documentNodes[i]!
      const ctx = new fabric.Canvas(fabricNode, { width: clientWidth, height: clientHeight })
      ctx.on('object:added', (e) => this.objectAdded(ctx, e))
      return ctx
    })

    this.host.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const activeStage = this.fabricNodes.find(ctx => ctx.getActiveObject())!
        const activeObjects = activeStage?.getActiveObjects();

        if (!activeObjects.length) {
          return
        }

        activeObjects.forEach(() => {
          activeStage.remove(...activeObjects);
          activeStage.renderAll();
        })
      }
    });
  }

  private objectAdded(ctx: fabric.Canvas, e: FabricEvent) {
    e.target.set({
      editable: true,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockMovementX: false,
      lockMovementY: false,
    })

    ctx.setActiveObject(e.target)
  }

  setMode(mode: FabricMode) {
    if (this.mode === mode) {
      return this.exitMode()
    }
    this.mode = mode
    switch (mode) {
      case FabricMode.Brush:
        return this.useBrush()
      case FabricMode.Text:
        return this.useText()
      case FabricMode.Picture:
        return this.usePicture()
      default:
        break
    }
  }

  exitMode() {
    this.mode = undefined
    this.fabricNodes.forEach(ctx => {
      ctx.freeDrawingBrush = undefined
      ctx.isDrawingMode = false
    })
  }

  private useBrush() {
    this.fabricNodes.forEach(ctx => {
      const brush = new fabric.PatternBrush(ctx)
      brush.getPatternSrc = () => this.getBrushPattern()
      ctx.freeDrawingBrush = brush
      ctx.isDrawingMode = true
      ctx.once('mouse:up', () => this.exitMode())
    })
  }

  setCurrentColor(color: string) {
    this.brush.color = color
    this.fontStyle.fill = color

    const activeStage = this.fabricNodes.find(ctx => ctx.getActiveObject())

    if (!activeStage) {
      return this.host.requestUpdate()
    }

    activeStage.getActiveObjects()
      .forEach(activeObject => this.setObjectColor(activeObject, color))

    this.host.requestUpdate()
  }

  private setObjectColor = (activeObject: fabric.FabricObject, color: string) => {
    if (activeObject.type.includes('text')) {
      activeObject.set('fill', color)
    }

    if (activeObject.type === 'line' || activeObject.type === 'path') {
      activeObject.set('stroke', color)
    }

    activeObject.canvas?.renderAll()
  }

  private usePicture = async () => {
    const picture = await new PictureReader().read()

    if (!picture) {
      return this.exitMode()
    }

    let isPlacingPicture = true

    this.fabricNodes.forEach(ctx => {
      ctx.once('mouse:down', (e) => {
        if (!isPlacingPicture) {
          return
        }

        isPlacingPicture = false
        this.exitMode()

        const pointer = ctx.getViewportPoint(e.e)
        picture.setX(pointer.x - picture.width / 2)
        picture.setY(pointer.y - picture.height / 2)

        ctx.add(picture)
        ctx.setActiveObject(picture)
      })
    })
  }

  private useText = () => {
    let isPlacingText = true

    this.fabricNodes.forEach((ctx) => {
      ctx.once('mouse:down', (e) => {
        if (!isPlacingText) {
          return
        }

        isPlacingText = false

        this.exitMode()

        const pointer = ctx.getViewportPoint(e.e)

        const text = new fabric.IText('', { left: pointer.x, top: pointer.y, ...this.fontStyle })

        ctx.add(text)
        ctx.setActiveObject(text)
        text.enterEditing()
      })
    })
  }

  private getBrushPattern() {
    const pattern = document.createElement('canvas')
    pattern.width = pattern.height = 10

    const ctx = pattern.getContext('2d')!
    ctx.fillStyle = this.brush.color
    ctx.fillRect(0, 0, pattern.width, pattern.height)

    return pattern
  }
}