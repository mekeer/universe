System.register([], function (exports) {
  'use strict'
  return {
    execute: function () {
      class Position {
        constructor (x = 0, y = 0) {
          this.x = x
          this.y = y
        }

        clone () {
          return new Position(this.x, this.y)
        }

        /**
           *两点间距离
           *
           * @static
           * @param {Position} 点1
           * @param {Position} 点2
           * @return {*}
           * @memberof Position
           */
        static distance (p1, p2) {
          return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
        }

        static twoPointsForAngle (p1, p2) {
          // 弧度
          return Math.atan2(p2.y - p1.y, p2.x - p1.x)
        }
      }

      class ByGravity {
        constructor (x = 0, y = 0) {
          this.x = x
          this.y = y
        }

        static toGravityList (starList, fps) {
          for (let i = 0; i < starList.length; i++) {
            const star1 = starList[i]
            for (let j = i + 1; j < starList.length; j++) {
              const star2 = starList[j]
              ByGravity.toGravity(star1, star2)
            }
          }
        }

        generageAcceleration (spe, quality, fps) {
          // console.log(fps);
          spe.x += this.accelerationFormula(this.x, quality) / fps
          spe.y += this.accelerationFormula(this.y, quality) / fps
          return spe
        }

        accelerationFormula (F, M) {
          return F / M
        }

        init () {
          this.x = 0
          this.y = 0
        }

        /**
           *
           *
           * @static
           * @param {Star} star1
           * @param {Star} star2
           * @return {*}
           * @memberof ByGravity
           */
        static generageGravity (star1, star2) {
          return (((star1.quality * star2.quality) /
                  Math.sqrt(Position.distance(star1.position, star2.position))) *
                  ByGravity.GRAVITATIONAL_CONSTANT)
        }

        static toGravity (star1, star2) {
          new ByGravity()
          const gravityAddedAmount = ByGravity.generageGravity(star1, star2)
          // console.log(star1);
          star1.byGravity.x +=
                  gravityAddedAmount *
                      Math.cos(-Position.twoPointsForAngle(star1.position, star2.position))
          star1.byGravity.y +=
                  gravityAddedAmount *
                      Math.sin(-Position.twoPointsForAngle(star2.position, star1.position))
          star2.byGravity.x -=
                  gravityAddedAmount *
                      Math.cos(-Position.twoPointsForAngle(star1.position, star2.position))
          star2.byGravity.y -=
                  gravityAddedAmount *
                      Math.sin(-Position.twoPointsForAngle(star2.position, star1.position))
        }
      }
      ByGravity.GRAVITATIONAL_CONSTANT = 1.4986684330971931438916522669669608

      class Area {
        constructor (startPosition, endPosition) {
          this.startPosition = startPosition
          this.endPosition = endPosition
        }

        get startPosition () {
          return this._startPosition
        }

        set startPosition (value) {
          this._startPosition = value
        }

        get endPosition () {
          return this._endPosition
        }

        set endPosition (value) {
          this._endPosition = value
        }

        clone () {
          return new Area(this.startPosition.clone(), this.endPosition.clone())
        }

        isTO (position) {
          if (position.x > this.startPosition.x &&
                  position.x < this.endPosition.x &&
                  position.y > this.startPosition.y &&
                  position.y < this.endPosition.y) {
            return true
          } else {
            return false
          }
        }
      }

      class Spe {
        constructor (x = 0, y = 0) {
          this.x = x
          this.y = y
        }
      }

      /**
       * 用来让显示窗口辨认并执行任何类型渲染的接口类
       *
       * @export
       * @class Render
       */
      class Render {
        render (ctx, showScreen) { }
        absoluteToRelative (position, showScreen) {
          return new Position((position.x - showScreen.position.x) / showScreen.magnification, (position.y - showScreen.position.y) / showScreen.magnification)
        }

        sizeScale (number, showScreen) {
          return (number / showScreen.magnification) * showScreen.graphicsZoom
        }
      }

      /**
       *  星球类
       *
       * @export
       * @class
       */
      class Star extends Render {
        constructor (position = new Position(), spe = new Spe(), quality = 100, r = undefined, byGravity = new ByGravity()) {
          super()
          /**
               * 质量
               *
               * @private
               * @type {number}
               */
          this._quality = 0
          /**
               * 半径
               *
               * @protected
               * @type {number}
               */
          this._r = 0
          /**
               *物质的密度
               *
               * @private
               * @type {number}
               * @memberof Star
               */
          this._density = 1
          /**
               * 物体的颜色
               *
               * @type {string}
               */
          this.color = '#ffffff'
          /**
               *  当前是否被拖拽状态
               *
               * @type {boolean}
               */
          this.isPressTo = false
          this.position = position
          this.spe = spe
          this._quality = quality
          if (r) {
            this._r = r
          }
          this._byGravity = byGravity
        }

        get quality () {
          return this._quality
        }

        set quality (value) {
          this._quality = value
          // 默认把质量当作圆的面积得到半径
          this.r = Math.sqrt(value / this.density / Math.PI)
        }

        get r () {
          return this._r
        }

        set r (value) {
          this._r = value
          this._quality = Math.PI * value * value
        }

        get density () {
          return this._density
        }

        set density (value) {
          this._r = this.r = Math.sqrt(this._quality / value / Math.PI)
          this._density = value
        }

        get byGravity () {
          return this._byGravity
        }

        set byGravity (value) {
          this._byGravity = value
        }

        /**
           * 渲染函数
           *
           * @param {CanvasRenderingContext2D} ctx
           * @param {ShowScreen} showScreen
           */
        render (ctx, showScreen) {
          ctx.save()
          ctx.beginPath()
          ctx.fillStyle = this.color
          const newPos = this.absoluteToRelative(this.position, showScreen)
          ctx.arc(newPos.x, newPos.y, this.sizeScale(this.r, showScreen), 0, 2 * Math.PI)
          ctx.fill()
          ctx.restore()
        }

        /**
           * 传入一个点，检测是否在其内
           * 求点到圆心的距离
           * @param {Position} position
           * @return {*}
           */
        checkIsPress (position) {
          const c = Position.distance(this.position, position)
          return c < this.r
        }
      }

      class initUniverseByRandom {
        constructor (numberTheStars = 10, minQuality = 100, maxQuality = 1000, minSpe = new Spe(-100, -100), maxSpe = new Spe(100, 100)) {
          this.randomlyGeneratedArea = new Area(new Position(-100000, -1000000), new Position(10000, 1000000))
          this.numberTheStars = numberTheStars
          this.minQuality = minQuality
          this.maxQuality = maxQuality
          this.maxSpe = maxSpe
          this.minSpe = minSpe
        }

        run (list, showScreen) {
          // 目标是随机在窗口显示区域内执行
          this.randomlyGeneratedArea = showScreen.area
          // for (let i: number = 0; i < this.numberTheStars; i++) {
          //   this.randomAddStar(list, showScreen);
          // }
          const sun = new Star()
          sun.position = new Position(300, 500)
          sun.quality = 10000
          sun.spe = new Spe(0, 0)
          sun.color = '#ff0000'
          sun.density = 1.408
          const earth = new Star()
          earth.position = new Position(1500, 500)
          earth.quality = 1000
          earth.spe = new Spe(0, -400)
          earth.color = '#00ff00'
          earth.density = 5.5
          const moon = new Star()
          moon.position = new Position(1450, 500)
          moon.quality = 100
          moon.spe = new Spe(0, -435)
          moon.color = '#FFffff'
          moon.density = 5.5
          list.push(moon)
          list.push(sun)
          // ``;
          list.push(earth)
        }

        randomAddStar (list, showScreen) {
          const star = new Star()
          star.position = new Position(this.getRandomArbitrary(this.randomlyGeneratedArea.startPosition.x, this.randomlyGeneratedArea.endPosition.x), this.getRandomArbitrary(this.randomlyGeneratedArea.startPosition.y, this.randomlyGeneratedArea.endPosition.y))
          star.quality = this.getRandomArbitrary(this.maxQuality, this.minQuality)
          // star.spe = this.getRandomArbitrarySpe();
          list.push(star)
        }

        getRandomArbitrarySpe () {
          const spe = new Spe(this.getRandomArbitrary(this.minSpe.x, this.maxSpe.x), this.getRandomArbitrary(this.minSpe.y, this.maxSpe.y))
          return spe
        }

        getRandomArbitrary (min, max) {
          return Math.random() * (max - min) + min
        }
      }

      class Arrow extends Render {
        constructor (startPosition, endPosition) {
          super()
          this.startPosition = startPosition
          this.endPosition = endPosition
        }

        /**
           * 给ShowScreen调用的显现方法，让其可以显示出来
           *
           * @overwrite
           * @param {CanvasRenderingContext2D} ctx
           * @param {ShowScreen} showScreen
           */
        render (ctx, showScreen) {
          ctx.save()
          ctx.beginPath()
          const newStartPosition = this.absoluteToRelative(this.startPosition, showScreen)
          const newEndPosition = this.absoluteToRelative(this.endPosition, showScreen)
          ctx.strokeStyle = '#0000ff'
          ctx.moveTo(newStartPosition.x, newStartPosition.y)
          ctx.lineTo(newEndPosition.x, newEndPosition.y)
          ctx.stroke()
          ctx.restore()
        }
      }

      class Lanch extends Render {
        constructor (star, monsePosition) {
          super()
          this.arrow = new Arrow(star.position, monsePosition)
          this.star = star
        }

        render (ctx, showScreen) {
          this.arrow.render(ctx, showScreen)
          this.star.render(ctx, showScreen)
        }
      }

      class Drive {
        constructor (run, fps = 60) {
          /**
               * fps决定多长时间执行一次
               *
               * @type {number}
               */
          this._fps = 60
          /**
               *  时间倍率，可以加速，但是并不是无限加的
               * 达到一个值后就会失去效果
               *
               * @type {number}
               */
          this._magnification = 1
          /**
               *  未经过计算的基础延迟参数
               *
               * @private
               * @type {number}
               */
          this._basicTimout = 10
          /**
               * 延迟经过倍率计算后的延迟
               *
               * @private
               * @type {number}
               */
          this.timeout = 10
          /**
               * setTimout的id
               *
               * @private
               * @type {(number | null)}
               */
          this.id = null
          /**
               * 驱动器
               * 用来驱动业务代码
               * 停止运行后所有信息不在更新
               *
               * @protected
               * @param {Function} run
               */
          this.drive = () => {
            this.run()
            this.id = setTimeout(this.drive, this.timeout)
          }
          this.run = run
          this.fps = fps
          this.continue()
        }

        get fps () {
          return this._fps
        }

        set fps (value) {
          this._fps = value
          this.basicTimout = 1000 / this._fps
        }

        get magnification () {
          return this._magnification
        }

        set magnification (value) {
          this._magnification = value
          this.timeout = this.basicTimout / this._magnification
        }

        set basicTimout (value) {
          this._basicTimout = value
          this.timeout = value / this._magnification
        }

        /**
           * 终止驱动器
           *
           */
        stop () {
          if (this.id) {
            clearTimeout(this.id)
            this.id = null
          }
        }

        /**
           * 继续执行驱动器
           *
           */
        continue () {
          if (!this.id) {
            this.id = setTimeout(this.drive, this.timeout)
          }
        }
      }

      /**
       *显示区
       *
       * @export
       * @class ShowScreen
       */
      class ShowScreen {
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
        constructor (canvas, ctx, list, position = new Position(), height, width, fps = 60) {
          this.startMouseEvent = null
          /**
               *鼠标绝对位置
               *
               * @private
               * @type {Position}
               * @memberof ShowScreen
               */
          this.currentMousePositionAbsolute = new Position()
          this.stateTheMouse = StateTheMouse.NORMAL
          this.graphicsZoom = 1
          this.renderList = []
          /**
               * 显示帧率
               *
               * @protected
               * @type {number}
               * @memberof ShowScreen
               */
          this.fpsStatistics = 0
          this.FPS = 0
          /**
               * 正在被拖动的星星
               *
               * @type {(Star | null)}
               * @memberof ShowScreen
               */
          this.accordingToStar = null
          /**
               *
               * 上一次移动事件
               * @type {LastTimeMouseEvent}
               * @memberof ShowScreen
               */
          this.lastTimeMouseEvent = null
          this.pattern = Pattern.NORMAL
          this.magnification = 1
          /**
               *按键安下事件
               *
               * @param {KeyboardEvent} e
               * @memberof ShowScreen
               */
          this.onKeyDown = (e) => {
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
          this.onKeyUp = (e) => {
            switch (e.code) {
              // case
              case 'ShiftLeft':
                if (this.pattern != Pattern.NORMAL) {
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
          this.onWheel = (e) => {
            if (this.pattern == Pattern.ADJUSTMENT_MODE) {
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
          this.onResize = () => {
            setTimeout(() => {
              this.height = this.canvas.offsetHeight
              this.width = this.canvas.offsetWidth
              console.log(this.canvas.offsetHeight)
            }, 0)
          }
          /**
               *鼠标在画布中按下
               *
               * @param {MouseEvent} event
               * @memberof ShowScreen
               */
          this.onMouseDown = (event) => {
            this.currentMousePositionAbsolute = this.relativeToAbsolute(new Position(event.clientX, event.clientY))
            if (event.button === 0) {
              // 左键按下
              console.log(this.stateTheMouse)
              if (this.stateTheMouse == StateTheMouse.NORMAL) {
                this.stateTheMouse = StateTheMouse.PRESS
                if (this.pattern == Pattern.ADJUSTMENT_MODE) {
                  // 工作区拖动
                  this.stateTheMouse = StateTheMouse.DRAG
                } else if (this.pattern == Pattern.NORMAL) {
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
                } else if (this.pattern == Pattern.NEW_MODEL) {
                  // 新建模式新建一个星球
                  const star = new Star(this.currentMousePositionAbsolute.clone())
                  star.isPressTo = true
                  this.accordingToStar = star
                  this.newLanch(star)
                  // 拖动模式
                  this.stateTheMouse = StateTheMouse.DRAG
                }
              } else if (this.stateTheMouse == StateTheMouse.LAUNCH) {
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
          this.onMouseMove = (e) => {
            // 当前鼠标在宇宙中的真实坐标
            this.currentMousePositionAbsolute = this.relativeToAbsolute(new Position(e.clientX, e.clientY))
            if (this.stateTheMouse == StateTheMouse.DRAG) {
              // 鼠标按下事件
              if (this.pattern == Pattern.NORMAL) {
                // 正常的按键模式
                this.drag(e)
              } else if (this.pattern == Pattern.ADJUSTMENT_MODE) {
                // 窗口调整模式
                this.dragShowScreen(e)
              } else if (this.pattern == Pattern.NEW_MODEL) {
                this.dragNewBuiltStar(e)
              }
            } else if (this.stateTheMouse == StateTheMouse.LAUNCH) {
              // 鼠标为箭头加速状态
              this.lanchMove()
            }
          }
          /**
               *  鼠标松开事件
               *
               * @private
               * @memberof ShowScreen
               */
          this.onMouseUp = () => {
            if (this.pattern == Pattern.NEW_MODEL) {
              if (this.stateTheMouse == StateTheMouse.DRAG) {
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
          this.dragShowScreen = (event) => {
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
          this.drag = (event) => {
            if (this.accordingToStar) {
              // 求相对于上一次移动当前小球移动的速度
              const absolutePositon = this.relativeToAbsolute(new Position(event.clientX, event.clientY))
              if (this.lastTimeMouseEvent) {
                this.accordingToStar.spe = this.speedMov(this.relativeToAbsolute(new Position(this.lastTimeMouseEvent.mouseEvent.clientX, this.lastTimeMouseEvent.mouseEvent.clientY)), this.lastTimeMouseEvent.listTime, absolutePositon, new Date())
              }
              this.lastTimeMouseEvent = new LastTimeMouseEvent(event)
              // this.accordingToStar.position.x = event.clientX + this.position.x;
              // this.accordingToStar.position.y = event.clientY + this.position.y;
              this.accordingToStar.position = absolutePositon
            }
          }
          canvas.height = height
          canvas.width = width
          this.canvas = canvas
          this.ctx = ctx
          this.list = list
          this._height = height
          this._width = width
          this._position = position
          this._area = new Area(position, new Position(position.x + width, position.y + height))
          this.drive = new Drive(() => {
            this.show()
          }, fps)
          new Drive(() => {
            this.FPS = this.fpsStatistics
            this.fpsStatistics = 0
          }, 1)
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

        get position () {
          return this._position
        }

        set position (value) {
          this._position = value
          this._area.startPosition = value
          this._area.endPosition.x = value.x + this._width
          this._area.endPosition.y = value.y + this._height
        }

        /**
           *显示区高度分辨率
           *
           * @type {number}
           * @memberof ShowScreen
           */
        get height () {
          return this._height
        }

        set height (value) {
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

        get width () {
          return this._width
        }

        set width (value) {
          const proportion = this._width / value
          this.canvas.width = value
          console.log(proportion)
          // this._area.endPosition.x =
          //   this._area.startPosition.x +
          //   (this._area.endPosition.x - this._area.startPosition.x) * proportion;
          this._width = value
        }

        get area () {
          return this._area
        }

        set area (value) {
          this._area = value
          // this._position = value.startPosition;
          // this._height = value.endPosition.y - value.startPosition.y;
          // this.width = value.endPosition.x - value.startPosition.x;
        }

        /**
           * 滚轮缩放放大缩小
           *
           * @param {WheelEvent} e
           * @memberof ShowScreen
           */
        magnifier (e) {
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
        move (deviationX, deviationY) {
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
        enlarge (rateConstant) {
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
        narrow (rateConstant) {
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

        dragNewBuiltStar (e) {
          if (this.accordingToStar) {
            this.accordingToStar.r = Position.distance(this.accordingToStar.position, this.currentMousePositionAbsolute)
          }
        }

        newLanch (star) {
          // 新建一个弹性移动对象
          this.lanch = new Lanch(star, this.currentMousePositionAbsolute)
          this.renderList.push(this.lanch)
        }

        lanchMove () {
          this.lanch.arrow.endPosition = this.currentMousePositionAbsolute
        }

        lanchUp () {
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
           * 已知两点和时间求速度
           *
           * @param {Position} 移动前位置
           * @param {Date} 移动前时间
           * @param {Position} 移动后位置
           * @param {Date} 移动后时间
           * @return {*}
           * @memberof ShowScreen
           */
        speedMov (movePositionBefore, moveTimeBefore, movePositionAfter, moveTimeAfter) {
          const beforeMovingToPresentTime = moveTimeAfter.getMilliseconds() - moveTimeBefore.getMilliseconds()
          const xSpe = ((movePositionAfter.x - movePositionBefore.x) /
                  beforeMovingToPresentTime) *
                  1000
          const ySpe = ((movePositionAfter.y - movePositionBefore.y) /
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
        show () {
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
        removeRender (render) {
          for (let i = 0; i < this.renderList.length; i++) {
            if (render == this.renderList[i]) {
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
        replaceRender (usedRender, newRender) {
          for (let i = 0; i < this.renderList.length; i++) {
            if (this.renderList[i] == usedRender) {
              this.renderList[i] = newRender
            }
          }
        }

        renderState () {
          this.fpsStatistics++
          const fontSize = 20
          this.ctx.save()
          this.ctx.beginPath()
          this.ctx.fillStyle = '#ffffff'
          this.ctx.font = 'bold ' + fontSize + 'px serif'
          this.ctx.fillText('FPS:' + this.FPS, 20, fontSize * 1.3)
          this.ctx.fillText('鼠标位置:' +
                  Math.floor(this.currentMousePositionAbsolute.x) +
                  ',' +
                  Math.floor(this.currentMousePositionAbsolute.y), 20, fontSize * 1.3 * 2)
          this.ctx.fillText('倍率' + this.magnification.toFixed(3), 20, fontSize * 1.3 * 3)
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
        relativeToAbsolute (position) {
          const newPosition = new Position(position.x * this.magnification + this._area.startPosition.x, position.y * this.magnification + this._area.startPosition.y)
          return newPosition
        }
      }
      /**
       * NORMAL是正常状态
       * PRESS 是鼠标按下状态
       * DRAG 是鼠标拖动物体的状态
       * @export
       * @enum {number}
       */
      let StateTheMouse;
      (function (StateTheMouse) {
        /**
           *正常模式
           */
        StateTheMouse[StateTheMouse.NORMAL = 0] = 'NORMAL'
        /**
           * 按下鼠标
           */
        StateTheMouse[StateTheMouse.PRESS = 1] = 'PRESS'
        /**
           * 拖动模式
           */
        StateTheMouse[StateTheMouse.DRAG = 2] = 'DRAG'
        /**
           * 弹力弹弓模式加速
           */
        StateTheMouse[StateTheMouse.LAUNCH = 3] = 'LAUNCH'
      })(StateTheMouse || (StateTheMouse = {}))
      /**
       * 上一次触发的鼠标事件
       * 用来计算鼠标在单位时间内运动速度
       * 好让小球被仍出去
       *
       * @export
       * @class LastTimeMouseEvent
       */
      class LastTimeMouseEvent {
        constructor (mouseEvent) {
          this.mouseEvent = mouseEvent
          this.listTime = new Date()
        }
      }
      /**
       * 状态
       * 此枚举作用是控制按键工作模式，比如现在按下shift应该快捷快件应该如何工作等
       *
       * @export
       * @enum {number}
       */
      let Pattern;
      (function (Pattern) {
        /**
           * 此模式可以调整星星的位置
           */
        Pattern[Pattern.NORMAL = 0] = 'NORMAL'
        /**
           * 此模式调整显示区位置和大小的功能
           */
        Pattern[Pattern.ADJUSTMENT_MODE = 1] = 'ADJUSTMENT_MODE'
        /**
           * 新建模式
           */
        Pattern[Pattern.NEW_MODEL = 2] = 'NEW_MODEL'
      })(Pattern || (Pattern = {}))

      class QuadtTree {
        constructor (bigStar, quality, len) {
          this.leftTop = null
          this.rightTop = null
          this.rightBottom = null
          this.leftBottom = null
          this.list = []
          this.len = 0
          this.qualitv = 0
          this.bigStar = bigStar
          this.len = len
          this.qualitv = quality
        }
      }

      /**
       * 宇宙类，承载整个系统
       *
       * @export
       * @class
       */
      class Universe extends Render {
        constructor (canvas, fps = 60) {
          super()
          this.drive = new Drive(() => { })
          /**
               * 宇宙的区域
               *
               * @type {Area}
               */
          this.constellation = new Area(new Position(), new Position())
          this.currentframe = 0
          this.offset = 0
          /**
               * 精度常数
               *
               * @type {number}
               */
          this.accuracy = 0.6
          this.canvas = canvas
          this.ctx = this.canvas.getContext('2d')
          this.drive.fps = fps
          this.list = new Array()
          this.init()
        }

        /**
           * 初始化方法
           *
           */
        init () {
          this.screen = new ShowScreen(this.canvas, this.ctx, this.list, new Position(), this.canvas.offsetHeight, this.canvas.offsetWidth)
          this.screen.enlarge(1)
          this.constellation = this.screen.area.clone()
          // 让显示窗渲染当前线框
          this.screen.renderList.push(this)
          new initUniverseByRandom().run(this.list, this.screen)
          this.drive.run = () => {
            this.gravity()
            this.currentframe++
            // this.quadtreeComputingGravity();
            this.move()
          }
        }

        render (ctx, showScreen) {
          this.showConstellation(ctx, showScreen)
        }

        /**
           * 用来显示当前宇宙中的物体所占用的最大空间一个线框
           *
           * @param {CanvasRenderingContext2D} ctx
           * @param {ShowScreen} showScreen
           */
        showConstellation (ctx, showScreen) {
          this.ctx.save()
          this.ctx.beginPath()
          const newStartPos = this.absoluteToRelative(this.constellation.startPosition, showScreen)
          const newEndPos = this.absoluteToRelative(this.constellation.endPosition, showScreen)
          this.ctx.strokeStyle = '#ff0000'
          this.ctx.lineWidth = 1
          // 虚线
          this.ctx.setLineDash([4, 4])
          // 蚂蚁线样式
          this.offset++
          this.ctx.lineDashOffset = -this.offset
          this.ctx.moveTo(newStartPos.x, newStartPos.y)
          this.ctx.lineTo(newEndPos.x, newStartPos.y)
          this.ctx.lineTo(newEndPos.x, newEndPos.y)
          this.ctx.lineTo(newStartPos.x, newEndPos.y)
          this.ctx.lineTo(newStartPos.x, newStartPos.y)
          this.ctx.stroke()
          this.ctx.restore()
        }

        /**
           * 移动命令执行函数
           *
          /**
           *  移动系统
           *
           */
        move () {
          this.constellation.startPosition.x +=
                  (this.constellation.endPosition.x - this.constellation.startPosition.x) *
                      0.01
          this.constellation.startPosition.y +=
                  (this.constellation.endPosition.y - this.constellation.startPosition.y) *
                      0.01
          this.constellation.endPosition.x -=
                  (this.constellation.endPosition.x - this.constellation.startPosition.x) *
                      0.01
          this.constellation.endPosition.y -=
                  (this.constellation.endPosition.y - this.constellation.startPosition.y) *
                      0.01
          // this.showConstellation();
          for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i]
            if (!item.isPressTo) {
              item.position.x += item.spe.x / this.drive.fps
              item.position.y += item.spe.y / this.drive.fps
            }
            // 判断当前元素所在区域
            if (item.position.x - item.r <= this.constellation.startPosition.x) {
              this.constellation.startPosition.x = item.position.x - item.r
            }
            if (item.position.x + item.r >= this.constellation.endPosition.x) {
              this.constellation.endPosition.x = item.position.x + item.r
            }
            if (item.position.y - item.r <= this.constellation.startPosition.y) {
              this.constellation.startPosition.y = item.position.y - item.r
            }
            if (item.position.y + item.r >= this.constellation.endPosition.y) {
              this.constellation.endPosition.y = item.position.y + item.r
            }
          }
        }

        /**
           * 万有引力生成器
           *
           */
        gravity () {
          for (let i = 0; i < this.list.length; i++) {
            const star1 = this.list[i]
            for (let j = i + 1; j < this.list.length; j++) {
              const star2 = this.list[j]
              ByGravity.toGravity(star1, star2)
            }
            star1.byGravity.generageAcceleration(star1.spe, star1.quality, this.drive.fps)
            star1.byGravity.init()
          }
        }

        quadtreeComputingGravity () {
          let rootLen = 0
          const stellWidth = this.constellation.endPosition.x - this.constellation.startPosition.x
          const stellHeight = this.constellation.endPosition.y - this.constellation.startPosition.y
          if (stellWidth > stellHeight) {
            rootLen = stellWidth
          } else {
            rootLen = stellHeight
          }
          let rootQuality = 0
          for (let i = 0; i < this.list.length; i++) {
            const star = this.list[i]
            rootQuality += star.quality
          }
          const rootTree = new QuadtTree(new Star(new Position(this.constellation.startPosition.x + rootLen / 2, this.constellation.startPosition.y + rootLen / 2), new Spe(), rootQuality), rootQuality, rootLen)
          rootTree.list = this.list
          // 分区
          const partition = (quadtTree, i) => {
            const LT = []
            let LTQ = 0
            const RT = []
            let RTQ = 0
            const LB = []
            let LBQ = 0
            const RB = []
            let RBQ = 0
            // 终止检测
            if (quadtTree.list.length <= 1) {
              return
            }
            // 检测星星属于哪个“天区”
            for (let i = 0; i < quadtTree.list.length; i++) {
              const star = quadtTree.list[i]
              if (star.position.y + star.r < quadtTree.bigStar.position.y) {
                // 如果x轴分隔线上面
                if (star.position.x + star.r < quadtTree.bigStar.position.x) {
                  // 如果在y轴分隔线左边
                  // 上左
                  LT.push(star)
                  LTQ += star.quality
                } else if (star.position.x - star.r > quadtTree.bigStar.position.x) {
                  // 如果在y轴分隔线右边
                  // 也包括了圆切线到y轴的情况
                  // 上右
                  RT.push(star)
                  RTQ += star.quality
                }
              } else if (star.position.y - star.r > quadtTree.bigStar.position.y) {
                // 如果在分隔线下面 ，同样包括了x轴为切线的情况
                if (star.position.x + star.r < quadtTree.bigStar.position.x) {
                  // 如果在y轴分隔线左边
                  // 下左
                  LB.push(star)
                  LBQ += star.quality
                } else if (star.position.x - star.r > quadtTree.bigStar.position.x) {
                  // 如果在y轴分隔线右边
                  // 也包括了圆切线到y轴的情况
                  // 下右
                  RB.push(star)
                  RBQ += star.quality
                }
              }
            }
            // 检测“天区”内是否存在星星从而继续向下分区
            const sonLen = quadtTree.len / 2
            if (sonLen == 0) {
              return
            }
            if (LTQ > 0) {
              const star = new Star(new Position(quadtTree.bigStar.position.x - sonLen / 2, quadtTree.bigStar.position.y - sonLen / 2), new Spe(), LTQ)
              quadtTree.leftTop = new QuadtTree(star, LTQ, sonLen)
              quadtTree.leftTop.list = LT
              partition(quadtTree.leftTop)
            }
            if (RTQ > 0) {
              const star = new Star(new Position(quadtTree.bigStar.position.x + sonLen / 2, quadtTree.bigStar.position.y - sonLen / 2), new Spe(), RTQ)
              quadtTree.rightTop = new QuadtTree(star, RTQ, sonLen)
              quadtTree.rightTop.list = RT
              partition(quadtTree.rightTop)
            }
            if (LBQ > 0) {
              const star = new Star(new Position(quadtTree.bigStar.position.x - sonLen / 2, quadtTree.bigStar.position.y + sonLen / 2), new Spe(), LBQ)
              quadtTree.leftBottom = new QuadtTree(star, LBQ, sonLen)
              quadtTree.leftBottom.list = LB
              partition(quadtTree.leftBottom)
            }
            if (RBQ > 0) {
              const star = new Star(new Position(quadtTree.bigStar.position.x + sonLen / 2, quadtTree.bigStar.position.y + sonLen / 2), new Spe(), RBQ)
              quadtTree.rightBottom = new QuadtTree(star, RBQ, sonLen)
              quadtTree.rightBottom.list = RB
              partition(quadtTree.rightBottom)
            }
          }
          partition(rootTree)
          // this.screen.renderList.push(rootTree.bigStar);
          const compute = (quadtTree, star) => {
            // 结束条件
            if (quadtTree.leftTop) { compute(quadtTree.leftTop, star) }
            if (quadtTree.rightTop) { compute(quadtTree.rightTop, star) }
            if (quadtTree.leftBottom) { compute(quadtTree.leftBottom, star) }
            if (quadtTree.rightBottom) { compute(quadtTree.rightBottom, star) }
            if (!quadtTree.leftTop &&
                      !quadtTree.rightTop &&
                      !quadtTree.leftBottom &&
                      !quadtTree.rightBottom) {
              // 由于星球重合了所以直接可以按照大星球的方式计算引力和加速度
              // ByGravity.toGravity(quadtTree.bigStar, star, this.drive.fps);
              // 1.如果区域内只有一个球
              if (quadtTree.list.length == 1 && quadtTree.list[0] != star) {
                ByGravity.toGravity(quadtTree.list[0], star)
                //  ByGravity.toGravity(quadtTree.bigStar, star);
                quadtTree.list[0].byGravity.init()
                console.log(this.currentframe)
              }
              // if (quadtTree.list[0] != star) {
              //   ByGravity.toGravity(quadtTree.bigStar, star);
              // }
              // ByGravity.toGravity(quadtTree.bigStar, star);
              // ByGravity.toGravityList(quadtTree.list, this.drive.fps);
              return
            }
            // 2.如果精度达到预期值就可以计算引力
            const distance = Position.distance(quadtTree.bigStar.position, star.position)
            if (quadtTree.list[0] != star) {
              console.log(quadtTree.len)
            }
            if (quadtTree.len / distance < this.accuracy) {
              ByGravity.toGravity(quadtTree.bigStar, star)
              console.log('满足条件')
            }
          }
          for (let i = 0; i < this.list.length; i++) {
            const star = this.list[i]
            star.byGravity.init()
            compute(rootTree, star)
          }
          for (let i = 0; i < this.list.length; i++) {
            const star = this.list[i]
            star.byGravity.generageAcceleration(star.spe, star.quality, this.drive.fps)
            star.byGravity.init()
          }
        }

        /**
           * 加速度生成器
           *
           */
        acceleration (f, m) {
          return f / m
        }
      } exports('Universe', Universe)
    }
  }
})
