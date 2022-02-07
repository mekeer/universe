import Position from './Position'
import Star from './Star'
import Area from './Area'
import Spe from './Spe'
import Lanch from './Lanch'
import Drive from './Drive'
import Render from './Render'
import { StateTheMouse } from '../emnu/StateTheMouse'
import { Pattern } from '../emnu/Pattern'

/**
 *显示区
 *
 * @export
 * @class ShowScreen
 */
export default class ShowScreen {
  /**
   *
   *  画布
   * @private
   * @type {HTMLCanvasElement}
   * @memberof ShowScreen
   */
  private canvas: HTMLCanvasElement
  /**
   * ctx
   *
   * @protected
   * @type {CanvasRenderingContext2D}
   * @memberof ShowScreen
   */
  protected ctx: CanvasRenderingContext2D
  /**
   *  显示位置
   *
   * @type {Position}
   * @memberof ShowScreen
   */
  public _position!: Position
  startMouseEvent: MouseEvent | null = null
  get position(): Position {
    return this._position
  }

  set position(value: Position) {
    this._position = value
    this._area.startPosition = value

    this._area.endPosition.x = value.x + this._width
    this._area.endPosition.y = value.y + this._height
  }

  public drive: Drive

  /**
   *鼠标绝对位置
   *
   * @private
   * @type {Position}
   * @memberof ShowScreen
   */
  private currentMousePositionAbsolute: Position = new Position()
  private stateTheMouse: StateTheMouse = StateTheMouse.NORMAL

  public _height!: number

  /**
   *显示区高度分辨率
   *
   * @type {number}
   * @memberof ShowScreen
   */
  get height(): number {
    return this._height
  }

  set height(value: number) {
    const proportion = this._height / value
    this.canvas.height = value
    this.magnification *= proportion
    this.graphicsZoom *= proportion
    console.log(proportion)

    // this._area.endPosition.y =
    //   this._area.startPosition.y +
    //   (this._area.endPosition.y - this._area.startPosition.y) * proportion;

    this._height = value
  }

  public graphicsZoom: number = 1
  /**
   * 显示区宽度分辨率
   *
   * @private
   * @type {number}
   * @memberof ShowScreen
   */
  private _width!: number
  public get width(): number {
    return this._width
  }

  public set width(value: number) {
    const proportion = this._width / value
    this.canvas.width = value
    console.log(proportion)
    // this._area.endPosition.x =
    //   this._area.startPosition.x +
    //   (this._area.endPosition.x - this._area.startPosition.x) * proportion;
    this._width = value
  }

  /**
   * 星星列表
   *
   * @protected
   * @type {Array<Star>}
   * @memberof ShowScreen
   */
  protected list: Star[]

  public renderList: Render[] = []

  /**
   * 显示帧率
   *
   * @protected
   * @type {number}
   * @memberof ShowScreen
   */
  protected fpsStatistics: number = 0
  protected FPS: number = 0

  /**
   * 将被显示的区域
   * 作用是从宇宙中截取任意的位置然后显示到屏幕上，显示区域会自动缩放显示
   * @private
   * @type {Area}
   * @memberof ShowScreen
   */
  private _area!: Area
  public get area(): Area {
    return this._area
  }

  public set area(value: Area) {
    this._area = value
    // this._position = value.startPosition;
    // this._height = value.endPosition.y - value.startPosition.y;
    // this.width = value.endPosition.x - value.startPosition.x;
  }

  /**
   * 正在被拖动的星星
   *
   * @type {(Star | null)}
   * @memberof ShowScreen
   */
  private accordingToStar: Star | null = null

  private lanch!: Lanch

  /**
   *
   * 上一次移动事件
   * @type {LastTimeMouseEvent}
   * @memberof ShowScreen
   */
  lastTimeMouseEvent: LastTimeMouseEvent | null = null

  pattern: Pattern = Pattern.NORMAL
  magnification: number = 1
  /**
   * Creates an instance of ShowScreen.
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLCanvasElement} ctx
   * @param {Array<Star>} list
   * @param {Position} [position=new Position()]
   * @param {number} height
   * @param {number} width
   * @param {number} [fps=60]
   * @memberof ShowScreen
   */
  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    list: Star[],
    position: Position = new Position(),
    height: number,
    width: number,
    fps: number = 60
  ) {
    canvas.height = height
    canvas.width = width
    this.canvas = canvas
    this.ctx = ctx
    this.list = list
    this._height = height
    this._width = width
    this._position = position
    this._area = new Area(
      position,
      new Position(position.x + width, position.y + height)
    )

    this.drive = new Drive(() => {
      this.show()
      this.FPS = this.fpsStatistics
      this.fpsStatistics = 0
    }, fps)

    // 我们为窗体添加事件让显示窗可移动
    canvas.addEventListener('mousedown', this.onMouseDown)
    // 鼠标移动监听
    this.canvas.addEventListener('mousemove', this.onMouseMove)
    // 鼠标松开
    canvas.addEventListener('mouseup', this.onMouseUp)
    // 鼠标移出范围
    canvas.addEventListener('mouseleave', this.onMouseUp)

    // 窗口大小发生改变
    window.addEventListener('resize', this.onResize)

    // 按键事件
    document.addEventListener('keydown', this.onKeyDown)
    // 鼠标滚轮
    document.addEventListener('wheel', this.onWheel)

    // 按键松开
    document.addEventListener('keyup', this.onKeyUp)
  }

  /**
   *按键安下事件
   *
   * @param {KeyboardEvent} e
   * @memberof ShowScreen
   */
  private readonly onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      // case
      case 'ShiftLeft':
        if (this.pattern !== Pattern.ADJUSTMENT_MODE) {
          this.pattern = Pattern.ADJUSTMENT_MODE
        }
        break
      case 'KeyN':
        if (this.pattern !== Pattern.NEW_MODEL) {
          this.pattern = Pattern.NEW_MODEL
        }
        break
    }
  }

  /**
   *document 按键放开事件
   *
   * @param {KeyboardEvent} e
   * @memberof ShowScreen
   */
  private readonly onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      // case
      case 'ShiftLeft':
        if (this.pattern !== Pattern.NORMAL) {
          this.pattern = Pattern.NORMAL
        }
        break
    }
  }

  /**
   * document 滚轮事件
   *
   * @param {WheelEvent} e
   * @memberof ShowScreen
   */
  private readonly onWheel = (e: WheelEvent) => {
    if (this.pattern === Pattern.ADJUSTMENT_MODE) {
      this.magnifier(e)
    }
  }

  /**
   * 页面放大缩小事件
   * 非显示窗口的放大缩小而是整个页面的缩放
   *
   * @private
   * @memberof ShowScreen
   */
  private readonly onResize = () => {
    setTimeout(() => {
      this.height = this.canvas.offsetHeight
      this.width = this.canvas.offsetWidth
      console.log(this.canvas.offsetHeight)
    }, 0)
  }

  /**
   * 滚轮缩放放大缩小
   *
   * @param {WheelEvent} e
   * @memberof ShowScreen
   */
  private magnifier(e: WheelEvent): void {
    // 修改工作区大小
    const rateConstant = 1.1
    if (e.deltaY > 0) {
      // 放大显示区
      this.enlarge(rateConstant)
    } else {
      // 缩小显示区
      this.narrow(rateConstant)
    }
    this._position = this._area.startPosition
  }

  /**
   * 让窗体平行移动的方法
   *
   * @memberof ShowScreen
   */
  public move(deviationX: number, deviationY: number): void {
    this.area.startPosition.x += deviationX
    this.area.startPosition.y += deviationY
    this.area.endPosition.x += deviationX
    this.area.endPosition.y += deviationY
  }

  /**
   * 放大显示区
   *
   * @param {number} rateConstant
   * @memberof ShowScreen
   */
  public enlarge(rateConstant: number): void {
    this.magnification *= rateConstant
    // const mouseXAxisPosition  = ;
    this._area.startPosition.x =
      this.currentMousePositionAbsolute.x -
      (this.currentMousePositionAbsolute.x - this.position.x) * rateConstant

    this._area.startPosition.y =
      this.currentMousePositionAbsolute.y -
      (this.currentMousePositionAbsolute.y - this._area.startPosition.y) *
        rateConstant

    this._area.endPosition.x =
      (this._area.endPosition.x - this.currentMousePositionAbsolute.x) *
        rateConstant +
      this.currentMousePositionAbsolute.x

    this._area.endPosition.y =
      (this._area.endPosition.y - this.currentMousePositionAbsolute.y) *
        rateConstant +
      this.currentMousePositionAbsolute.y
  }

  /**
   * 缩小显示区
   *
   * @param {number} rateConstant
   * @memberof ShowScreen
   */
  public narrow(rateConstant: number): void {
    this.magnification /= rateConstant
    this._area.startPosition.x =
      this.currentMousePositionAbsolute.x -
      (this.currentMousePositionAbsolute.x - this.position.x) / rateConstant

    this._area.startPosition.y =
      this.currentMousePositionAbsolute.y -
      (this.currentMousePositionAbsolute.y - this._area.startPosition.y) /
        rateConstant

    this._area.endPosition.x =
      (this._area.endPosition.x - this.currentMousePositionAbsolute.x) /
        rateConstant +
      this.currentMousePositionAbsolute.x

    this._area.endPosition.y =
      (this._area.endPosition.y - this.currentMousePositionAbsolute.y) /
        rateConstant +
      this.currentMousePositionAbsolute.y
  }

  /**
   *鼠标在画布中按下
   *
   * @param {MouseEvent} event
   * @memberof ShowScreen
   */
  private readonly onMouseDown = (event: MouseEvent) => {
    this.currentMousePositionAbsolute = this.relativeToAbsolute(
      new Position(event.clientX, event.clientY)
    )
    if (event.button === 0) {
      // 左键按下
      console.log(this.stateTheMouse)

      if (this.stateTheMouse === StateTheMouse.NORMAL) {
        this.stateTheMouse = StateTheMouse.PRESS
        if (this.pattern === Pattern.ADJUSTMENT_MODE) {
          // 工作区拖动
          this.stateTheMouse = StateTheMouse.DRAG
        } else if (this.pattern === Pattern.NORMAL) {
          const pressToPosition = this.currentMousePositionAbsolute

          for (let i = 0; i < this.list.length; i++) {
            const element = this.list[i]

            if (element.checkIsPress(pressToPosition)) {
              // 判断有没有点到圆球
              // 这里是已经检测到按到了小球启动了拖动状态

              this.stateTheMouse = StateTheMouse.DRAG
              element.isPressTo = true
              this.accordingToStar = element
            } else {
              // 如果没有触发其他效果就只认为按了一下
              this.stateTheMouse = StateTheMouse.PRESS
            }
          }
        } else if (this.pattern === Pattern.NEW_MODEL) {
          // 新建模式新建一个星球
          const star = new Star(this.currentMousePositionAbsolute.clone())
          star.isPressTo = true
          this.accordingToStar = star
          this.newLanch(star)
          // 拖动模式
          this.stateTheMouse = StateTheMouse.DRAG
        }
      } else if (this.stateTheMouse === StateTheMouse.LAUNCH) {
        this.lanchUp()
        this.stateTheMouse = StateTheMouse.NORMAL
      }

      this.startMouseEvent = event
    }
  }

  /**
   *鼠标移动事件
   *
   * @param {MouseEvent} e
   * @memberof ShowScreen
   */
  private readonly onMouseMove = (e: MouseEvent) => {
    // 当前鼠标在宇宙中的真实坐标
    this.currentMousePositionAbsolute = this.relativeToAbsolute(
      new Position(e.clientX, e.clientY)
    )

    if (this.stateTheMouse === StateTheMouse.DRAG) {
      // 鼠标按下事件

      if (this.pattern === Pattern.NORMAL) {
        // 正常的按键模式
        this.drag(e)
      } else if (this.pattern === Pattern.ADJUSTMENT_MODE) {
        // 窗口调整模式
        this.dragShowScreen(e)
      } else if (this.pattern === Pattern.NEW_MODEL) {
        this.dragNewBuiltStar(e)
      }
    } else if (this.stateTheMouse === StateTheMouse.LAUNCH) {
      // 鼠标为箭头加速状态
      this.lanchMove()
    }
  }

  public dragNewBuiltStar(e: MouseEvent): void {
    if (this.accordingToStar) {
      this.accordingToStar.r = Position.distance(
        this.accordingToStar.position,
        this.currentMousePositionAbsolute
      )
    }
  }

  private newLanch(star: Star): void {
    // 新建一个弹性移动对象
    this.lanch = new Lanch(star, this.currentMousePositionAbsolute)
    this.renderList.push(this.lanch)
  }

  private lanchMove(): void {
    this.lanch.arrow.endPosition = this.currentMousePositionAbsolute
  }

  private lanchUp(): void {
    this.lanch.star.spe.x =
      (this.lanch.arrow.endPosition.x - this.lanch.arrow.startPosition.x) * 2
    this.lanch.star.spe.y =
      (this.lanch.arrow.endPosition.y - this.lanch.arrow.startPosition.y) * 2

    this.removeRender(this.lanch)
    this.list.push(this.lanch.star)
    this.pattern = Pattern.NORMAL
    this.stateTheMouse = StateTheMouse.NORMAL
  }

  /**
   *  鼠标松开事件
   *
   * @private
   * @memberof ShowScreen
   */
  private readonly onMouseUp = () => {
    if (this.pattern === Pattern.NEW_MODEL) {
      if (this.stateTheMouse === StateTheMouse.DRAG) {
        this.stateTheMouse = StateTheMouse.LAUNCH
      }
    } else {
      console.log('')

      this.stateTheMouse = StateTheMouse.NORMAL
    }

    // 取消拖动
    if (this.accordingToStar) {
      this.accordingToStar.isPressTo = false
    }
    // 消除负载
  }

  /**
   *
   *  拖动窗口显示区域
   * @param {MouseEvent} event
   * @memberof ShowScreen
   */
  private readonly dragShowScreen = (event: MouseEvent) => {
    this._area.startPosition.x += event.movementX * -1 * this.magnification
    this._area.startPosition.y += event.movementY * -1 * this.magnification
    this._area.endPosition.x += event.movementX * -1 * this.magnification
    this._area.endPosition.y += event.movementY * -1 * this.magnification
  }

  /**
   *拖动
   * @param {MouseEvent} event
   * @memberof ShowScreen
   */
  private readonly drag = (event: MouseEvent) => {
    if (this.accordingToStar) {
      // 求相对于上一次移动当前小球移动的速度
      const absolutePositon = this.relativeToAbsolute(
        new Position(event.clientX, event.clientY)
      )
      if (this.lastTimeMouseEvent) {
        this.accordingToStar.spe = this.speedMov(
          this.relativeToAbsolute(
            new Position(
              this.lastTimeMouseEvent.mouseEvent.clientX,
              this.lastTimeMouseEvent.mouseEvent.clientY
            )
          ),
          this.lastTimeMouseEvent.listTime,

          absolutePositon,
          new Date()
        )
      }

      this.lastTimeMouseEvent = new LastTimeMouseEvent(event)
      // this.accordingToStar.position.x = event.clientX + this.position.x;
      // this.accordingToStar.position.y = event.clientY + this.position.y;
      this.accordingToStar.position = absolutePositon
    }
  }

  /**
   * 已知两点和时间求速度
   *
   * @param {Position} 移动前位置
   * @param {Date} 移动前时间
   * @param {Position} 移动后位置
   * @param {Date} 移动后时间
   * @return {*}
   * @memberof ShowScreen
   */
  public speedMov(
    movePositionBefore: Position,
    moveTimeBefore: Date,
    movePositionAfter: Position,
    moveTimeAfter: Date
  ): Spe {
    const beforeMovingToPresentTime =
      moveTimeAfter.getMilliseconds() - moveTimeBefore.getMilliseconds()
    const xSpe =
      ((movePositionAfter.x - movePositionBefore.x) /
        beforeMovingToPresentTime) *
      1000
    const ySpe =
      ((movePositionAfter.y - movePositionBefore.y) /
        beforeMovingToPresentTime) *
      1000

    return new Spe(xSpe, ySpe)
  }

  /**
   * 显示方法
   * 此方法用来触发元素的渲染函数
   * @private
   * @memberof ShowScreen
   */
  private show(): void {
    // 一个和画布一样大的正方形，用来清空画布
    // this.ctx.fillStyle = "#000000";

    this.ctx.fillRect(0, 0, this.width, this.height)
    this.renderState()
    for (let i = 0; i < this.list.length; i++) {
      const star = this.list[i]
      if (this._area.isTO(star.position)) {
        star.render(this.ctx, this)
      }
    }

    // 渲染自定义渲染
    for (let i = 0; i < this.renderList.length; i++) {
      const render = this.renderList[i]
      render.render(this.ctx, this)
    }
  }

  /**
   * render的删除方法
   *
   * @param {Render} render
   * @memberof ShowScreen
   */
  removeRender(render: Render): void {
    for (let i = 0; i < this.renderList.length; i++) {
      if (render === this.renderList[i]) {
        this.renderList.splice(i, 1)
      }
    }
  }

  /**
   * render的替换方法
   *
   * @param {Render} usedRender
   * @param {Render} newRender
   * @memberof ShowScreen
   */
  replaceRender(usedRender: Render, newRender: Render): void {
    for (let i = 0; i < this.renderList.length; i++) {
      if (this.renderList[i] === usedRender) {
        this.renderList[i] = newRender
      }
    }
  }

  private renderState(): void {
    this.fpsStatistics++
    const fontSize = 20
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold ' + fontSize.toString() + 'px serif'
    this.ctx.fillText('FPS:' + this.FPS.toString(), 20, fontSize * 1.3)
    this.ctx.fillText(
      `鼠标位置:${Math.floor(
        this.currentMousePositionAbsolute.x
      )} ,${Math.floor(this.currentMousePositionAbsolute.y)}
    `,
      20,
      fontSize * 1.3 * 2
    )
    this.ctx.fillText(
      '倍率' + this.magnification.toFixed(3),
      20,
      fontSize * 1.3 * 3
    )

    this.ctx.strokeStyle = '#ffffff'
    this.ctx.stroke()
    this.ctx.restore()
  }

  /**
   * 把在窗口外的相对位置转宇宙内的绝对位置
   * 比如鼠标相对与文档的位置
   *
   * @memberof ShowScreen
   */
  relativeToAbsolute(position: Position): Position {
    const newPosition = new Position(
      position.x * this.magnification + this._area.startPosition.x,
      position.y * this.magnification + this._area.startPosition.y
    )
    return newPosition
  }
}

/**
 * 上一次触发的鼠标事件
 * 用来计算鼠标在单位时间内运动速度
 * 好让小球被仍出去
 *
 * @export
 * @class LastTimeMouseEvent
 */
export class LastTimeMouseEvent {
  listTime: Date
  mouseEvent: MouseEvent
  constructor(mouseEvent: MouseEvent) {
    this.mouseEvent = mouseEvent
    this.listTime = new Date()
  }
}
