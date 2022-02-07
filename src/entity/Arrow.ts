import Position from "./Position";
import Render from "./Render";
import ShowScreen from "./ShowScreen";

export default class extends Render {
  public startPosition: Position;
  public endPosition: Position;
  constructor(startPosition: Position, endPosition: Position) {
    super();

    this.startPosition = startPosition;
    this.endPosition = endPosition;
  }

  /**
   * 给ShowScreen调用的显现方法，让其可以显示出来
   *
   * @overwrite
   * @param {CanvasRenderingContext2D} ctx
   * @param {ShowScreen} showScreen
   */
  render(ctx: CanvasRenderingContext2D, showScreen: ShowScreen): void {
    ctx.save();
    ctx.beginPath();
    const newStartPosition = this.absoluteToRelative(
      this.startPosition,
      showScreen
    );
    const newEndPosition = this.absoluteToRelative(
      this.endPosition,
      showScreen
    );
    ctx.strokeStyle = "#0000ff";

    ctx.moveTo(newStartPosition.x, newStartPosition.y);
    ctx.lineTo(newEndPosition.x, newEndPosition.y);

    ctx.stroke();
    ctx.restore();
  }
}
