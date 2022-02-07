export default class {
  /**
   * fps决定多长时间执行一次
   *
   * @type {number}
   */
  private _fps: number = 60
  public get fps(): number {
    return this._fps
  }

  public set fps(value: number) {
    this._fps = value
    this.basicTimout = 1000 / this._fps
  }

  /**
   *  时间倍率，可以加速，但是并不是无限加的
   * 达到一个值后就会失去效果
   *
   * @type {number}
   */
  private _magnification: number = 1
  public get magnification(): number {
    return this._magnification
  }

  public set magnification(value: number) {
    this._magnification = value
    this.timeout = this.basicTimout / this._magnification
  }

  /**
   *  未经过计算的基础延迟参数
   *
   * @private
   * @type {number}
   */
  private _basicTimout: number = 10
  // eslint-disable-next-line accessor-pairs
  public set basicTimout(value: number) {
    this._basicTimout = value
    this.timeout = value / this._magnification
  }

  /**
   * 延迟经过倍率计算后的延迟
   *
   * @private
   * @type {number}
   */
  private timeout: number = 10

  /**
   * setTimout的id
   *
   * @private
   * @type {(number | null)}
   */
  private id: NodeJS.Timeout | null = null

  /**
   * 要运行的业务代码
   *
   * @type {Function}
   */
  public run: Function

  constructor(run: Function, fps: number = 60) {
    this.run = run
    this.fps = fps
    this.continue()
  }

  /**
   * 终止驱动器
   *
   */
  public stop(): void {
    if (this.id) {
      clearTimeout(this.id)
      this.id = null
    }
  }

  /**
   * 继续执行驱动器
   *
   */
  public continue(): void {
    if (!this.id) {
      this.id = setTimeout(this.drive, this.timeout)
    }
  }

  /**
   * 驱动器
   * 用来驱动业务代码
   * 停止运行后所有信息不在更新
   *
   * @protected
   * @param {Function} run
   */
  private readonly drive = () => {
    this.run()
    this.id = setTimeout(this.drive, this.timeout)
  }
}
