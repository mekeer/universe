import ByGravity from './ByGravity'
import Position from './Position'
import Spe from './Spe'
import ShowScreen from './ShowScreen'
import Render from './Render'

/**
 *  星球类
 *
 * @export
 * @class
 */
export default class Star extends Render {
  /**
   * 位置
   *
   * @type {Position}
   */
  position: Position

  /**
   * 速度
   *
   * @type {Spe}
   */
  spe: Spe

  /**
   * 质量
   *
   * @private
   * @type {number}
   */
  private _quality: number = 0
  public get quality(): number {
    return this._quality
  }
  public set quality(value: number) {
    this._quality = value
    //默认把质量当作圆的面积得到半径
    this.r = Math.sqrt(value / this.density / Math.PI)
  }

  /**
   * 半径
   *
   * @protected
   * @type {number}
   */
  private _r: number = 0
  public get r(): number {
    return this._r
  }
  public set r(value: number) {
    this._r = value
    this._quality = Math.PI * value * value
  }

  /**
   *物质的密度
   *
   * @private
   * @type {number}
   * @memberof Star
   */
  private _density: number = 1
  public get density(): number {
    return this._density
  }
  public set density(value: number) {
    this._r = this.r = Math.sqrt(this._quality / value / Math.PI)
    this._density = value
  }

  /**
   * 受到的引力
   *
   * @private
   * @type {ByGravity}
   */
  private _byGravity!: ByGravity
  public get byGravity(): ByGravity {
    return this._byGravity
  }
  public set byGravity(value: ByGravity) {
    this._byGravity = value
  }

  /**
   * 物体的颜色
   *
   * @type {string}
   */
  color: string = '#ffffff'

  /**
   *  当前是否被拖拽状态
   *
   * @type {boolean}
   */
  isPressTo: boolean = false

  constructor(
    position: Position = new Position(),
    spe: Spe = new Spe(),
    quality: number = 100,
    r: number | undefined = undefined,
    byGravity: ByGravity = new ByGravity()
  ) {
    super()
    this.position = position
    this.spe = spe
    this._quality = quality
    if (r) {
      this._r = r
    }
    this._byGravity = byGravity
  }

  /**
   * 渲染函数
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {ShowScreen} showScreen
   */
  render(ctx: CanvasRenderingContext2D, showScreen: ShowScreen) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = this.color

    const newPos = this.absoluteToRelative(this.position, showScreen)
    ctx.arc(
      newPos.x,
      newPos.y,
      this.sizeScale(this.r, showScreen),
      0,
      2 * Math.PI
    )
    ctx.fill()
    ctx.restore()
  }

  /**
   * 传入一个点，检测是否在其内
   * 求点到圆心的距离
   * @param {Position} position
   * @return {*}
   */
  checkIsPress(position: Position) {
    let c: number = Position.distance(this.position, position)
    return c < this.r
  }
}
