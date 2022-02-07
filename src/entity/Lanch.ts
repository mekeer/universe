import Arrow from './Arrow'
import Render from './Render'
import Star from './Star'
import Position from './Position'
import ShowScreen from './ShowScreen'

export default class extends Render {
  public star: Star
  public arrow: Arrow
  constructor(star: Star, monsePosition: Position) {
    super()
    this.arrow = new Arrow(star.position, monsePosition)
    this.star = star
  }

  render(ctx: CanvasRenderingContext2D, showScreen: ShowScreen): void {
    this.arrow.render(ctx, showScreen)
    this.star.render(ctx, showScreen)
  }
}
