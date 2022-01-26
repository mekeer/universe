import ByGravity from './ByGravity'
import initUniverseByRandom from './initUniverseByRandom'
import Position from './Position'
import position from './Position'
import ShowScreen from './ShowScreen'
import Spe from './Spe'
import Star from './Star'
import Stars from './Star'
import Area from './Area'
import Render from './Render'
import Drive from './Drive'
import QuadtTree from './QuadtTree'

/**
 * 宇宙类，承载整个系统
 *
 * @export
 * @class
 */
export default class extends Render {
  /**
   * CanvasDom对象
   *
   * @protected
   * @type {HTMLCanvasElement}
   */
  protected canvas: HTMLCanvasElement

  /**
   * canves渲染器
   *
   * @protected
   * @type {CanvasRenderingContext2D}
   */
  protected ctx: CanvasRenderingContext2D

  /**
   * 显示对象，你的电脑屏幕，或者偷窥二维的一个相机
   *
   * @protected
   * @type {ShowScreen}
   */
  protected screen!: ShowScreen

  /**
   * 定时驱动器
   *
   * @type {Drive}
   */
  public drive: Drive = new Drive(() => {})

  /**
   * 存放星球的列表
   *
   * @protected
   * @type {Array<Stars>}
   */
  protected list: Array<Stars>

  /**
   * 宇宙的区域
   *
   * @type {Area}
   */
  constellation: Area = new Area(new Position(), new Position())

  constructor(canvas: HTMLCanvasElement, fps: number = 60) {
    super()
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.drive.fps = fps
    this.list = new Array<Stars>()

    this.init()
  }

  /**
   * 初始化方法
   *
   */
  init() {
    this.screen = new ShowScreen(
      this.canvas,
      this.ctx,
      this.list,
      new position(),
      this.canvas.offsetHeight,
      this.canvas.offsetWidth
    )
    this.screen.enlarge(1)

    this.constellation = this.screen.area.clone()

    //让显示窗渲染当前线框
    this.screen.renderList.push(this)

    new initUniverseByRandom().run(this.list, this.screen)
    this.drive.run = () => {
      this.gravity()
      this.currentframe++
      // this.quadtreeComputingGravity();
      this.move()
    }
  }
  currentframe: number = 0
  render(ctx: CanvasRenderingContext2D, showScreen: ShowScreen) {
    this.showConstellation(ctx, showScreen)
  }

  private offset: number = 0
  /**
   * 用来显示当前宇宙中的物体所占用的最大空间一个线框
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {ShowScreen} showScreen
   */
  showConstellation(ctx: CanvasRenderingContext2D, showScreen: ShowScreen) {
    this.ctx.save()
    this.ctx.beginPath()

    let newStartPos = this.absoluteToRelative(
      this.constellation.startPosition,
      showScreen
    )
    let newEndPos = this.absoluteToRelative(
      this.constellation.endPosition,
      showScreen
    )
    this.ctx.strokeStyle = '#ff0000'
    this.ctx.lineWidth = 1
    //虚线
    this.ctx.setLineDash([4, 4])
    //蚂蚁线样式
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
  move() {
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

      //判断当前元素所在区域
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
  gravity() {
    for (let i = 0; i < this.list.length; i++) {
      const star1 = this.list[i]
      for (let j = i + 1; j < this.list.length; j++) {
        const star2 = this.list[j]
        ByGravity.toGravity(star1, star2)
      }

      star1.byGravity.generageAcceleration(
        star1.spe,
        star1.quality,
        this.drive.fps
      )

      star1.byGravity.init()
    }
  }

  /**
   * 精度常数
   *
   * @type {number}
   */
  accuracy: number = 0.6

  quadtreeComputingGravity() {
    let rootLen = 0
    const stellWidth =
      this.constellation.endPosition.x - this.constellation.startPosition.x
    const stellHeight =
      this.constellation.endPosition.y - this.constellation.startPosition.y
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

    const rootTree = new QuadtTree(
      new Star(
        new Position(
          this.constellation.startPosition.x + rootLen / 2,
          this.constellation.startPosition.y + rootLen / 2
        ),
        new Spe(),
        rootQuality
      ),
      rootQuality,
      rootLen
    )

    rootTree.list = this.list
    let z = 0

    //分区
    const partition = (quadtTree: QuadtTree, i: number) => {
      let LT: Array<Star> = []
      let LTQ: number = 0
      let RT: Array<Star> = []
      let RTQ: number = 0
      let LB: Array<Star> = []
      let LBQ: number = 0
      let RB: Array<Star> = []
      let RBQ: number = 0
      z++
      //终止检测
      if (quadtTree.list.length <= 1) {
        return
      }
      //检测星星属于哪个“天区”
      for (let i = 0; i < quadtTree.list.length; i++) {
        const star = quadtTree.list[i]
        if (star.position.y + star.r < quadtTree.bigStar.position.y) {
          //如果x轴分隔线上面
          if (star.position.x + star.r < quadtTree.bigStar.position.x) {
            //如果在y轴分隔线左边
            //上左
            LT.push(star)
            LTQ += star.quality
          } else if (star.position.x - star.r > quadtTree.bigStar.position.x) {
            //如果在y轴分隔线右边
            //也包括了圆切线到y轴的情况
            //上右
            RT.push(star)
            RTQ += star.quality
          }
        } else if (star.position.y - star.r > quadtTree.bigStar.position.y) {
          //如果在分隔线下面 ，同样包括了x轴为切线的情况
          if (star.position.x + star.r < quadtTree.bigStar.position.x) {
            //如果在y轴分隔线左边
            //下左
            LB.push(star)
            LBQ += star.quality
          } else if (star.position.x - star.r > quadtTree.bigStar.position.x) {
            //如果在y轴分隔线右边
            //也包括了圆切线到y轴的情况
            //下右
            RB.push(star)
            RBQ += star.quality
          }
        }
      }

      //检测“天区”内是否存在星星从而继续向下分区
      const sonLen = quadtTree.len / 2

      if (sonLen == 0) {
        return
      }
      if (LTQ > 0) {
        const star = new Star(
          new Position(
            quadtTree.bigStar.position.x - sonLen / 2,
            quadtTree.bigStar.position.y - sonLen / 2
          ),
          new Spe(),
          LTQ
        )
        quadtTree.leftTop = new QuadtTree(star, LTQ, sonLen)
        quadtTree.leftTop.list = LT
        partition(quadtTree.leftTop, i++)
      }

      if (RTQ > 0) {
        const star = new Star(
          new Position(
            quadtTree.bigStar.position.x + sonLen / 2,
            quadtTree.bigStar.position.y - sonLen / 2
          ),
          new Spe(),
          RTQ
        )
        quadtTree.rightTop = new QuadtTree(star, RTQ, sonLen)
        quadtTree.rightTop.list = RT
        partition(quadtTree.rightTop, i++)
      }
      if (LBQ > 0) {
        const star = new Star(
          new Position(
            quadtTree.bigStar.position.x - sonLen / 2,
            quadtTree.bigStar.position.y + sonLen / 2
          ),
          new Spe(),
          LBQ
        )
        quadtTree.leftBottom = new QuadtTree(star, LBQ, sonLen)
        quadtTree.leftBottom.list = LB
        partition(quadtTree.leftBottom, i++)
      }
      if (RBQ > 0) {
        const star = new Star(
          new Position(
            quadtTree.bigStar.position.x + sonLen / 2,
            quadtTree.bigStar.position.y + sonLen / 2
          ),
          new Spe(),
          RBQ
        )
        quadtTree.rightBottom = new QuadtTree(star, RBQ, sonLen)
        quadtTree.rightBottom.list = RB
        partition(quadtTree.rightBottom, i++)
      }
    }

    partition(rootTree, 1)
    // this.screen.renderList.push(rootTree.bigStar);
    const compute = (quadtTree: QuadtTree, star: Star) => {
      //结束条件
      if (quadtTree.leftTop) compute(quadtTree.leftTop, star)
      if (quadtTree.rightTop) compute(quadtTree.rightTop, star)
      if (quadtTree.leftBottom) compute(quadtTree.leftBottom, star)
      if (quadtTree.rightBottom) compute(quadtTree.rightBottom, star)
      if (
        !quadtTree.leftTop &&
        !quadtTree.rightTop &&
        !quadtTree.leftBottom &&
        !quadtTree.rightBottom
      ) {
        //由于星球重合了所以直接可以按照大星球的方式计算引力和加速度
        // ByGravity.toGravity(quadtTree.bigStar, star, this.drive.fps);
        //1.如果区域内只有一个球
        if (quadtTree.list.length == 1 && quadtTree.list[0] != star) {
          ByGravity.toGravity(quadtTree.list[0], star)
          //  ByGravity.toGravity(quadtTree.bigStar, star);
          quadtTree.list[0].byGravity.init()
          console.log(this.currentframe)
        } else {
          //2.考虑到星球重合的情况（即使在显示中不可能发生）
          // ByGravity.toGravityList(quadtTree.list, this.drive.fps);
        }
        // if (quadtTree.list[0] != star) {
        //   ByGravity.toGravity(quadtTree.bigStar, star);
        // }
        // ByGravity.toGravity(quadtTree.bigStar, star);
        // ByGravity.toGravityList(quadtTree.list, this.drive.fps);
        return
      }

      //2.如果精度达到预期值就可以计算引力
      const distance = Position.distance(
        quadtTree.bigStar.position,
        star.position
      )
      if (quadtTree.list[0] != star) {
        console.log(quadtTree.len)
      }

      if (quadtTree.len / distance < this.accuracy) {
        ByGravity.toGravity(quadtTree.bigStar, star)
        console.log('满足条件')

        return
      }
    }
    for (let i = 0; i < this.list.length; i++) {
      const star = this.list[i]
      star.byGravity.init()
      compute(rootTree, star)
    }
    for (let i = 0; i < this.list.length; i++) {
      const star = this.list[i]
      star.byGravity.generageAcceleration(
        star.spe,
        star.quality,
        this.drive.fps
      )
      star.byGravity.init()
    }
  }

  /**
   * 加速度生成器
   *
   */
  acceleration(f: number, m: number) {
    return f / m
  }
}
