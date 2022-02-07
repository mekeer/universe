import ShowScreen from './ShowScreen'
import Position from './Position'

/**
 * 用来让显示窗口辨认并执行任何类型渲染的接口类
 *
 * @export
 * @class Render
 */
export default class Render {
  render(ctx: CanvasRenderingContext2D, showScreen: ShowScreen): void {}
  absoluteToRelative(position: Position, showScreen: ShowScreen): Position {
    return new Position(
      (position.x - showScreen.position.x) / showScreen.magnification,
      (position.y - showScreen.position.y) / showScreen.magnification
    )
  }

  sizeScale(number: number, showScreen: ShowScreen): number {
    return (number / showScreen.magnification) * showScreen.graphicsZoom
  }
}
