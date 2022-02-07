import Position from './Position'
import Spe from './Spe'
import Star from './Star'

export default class ByGravity {
  // 受到的引力
  x: number
  y: number
  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  static toGravityList(starList: Star[], fps: number): void {
    for (let i = 0; i < starList.length; i++) {
      const star1 = starList[i]
      for (let j = i + 1; j < starList.length; j++) {
        const star2 = starList[j]
        ByGravity.toGravity(star1, star2)
      }
    }
  }

  generageAcceleration(spe: Spe, quality: number, fps: number): Spe {
    // console.log(fps);

    spe.x += this.accelerationFormula(this.x, quality) / fps
    spe.y += this.accelerationFormula(this.y, quality) / fps
    return spe
  }

  accelerationFormula(F: number, M: number): number {
    return F / M
  }

  public init(): void {
    this.x = 0
    this.y = 0
  }

  // eslint-disable-next-line no-loss-of-precision
  public static GRAVITATIONAL_CONSTANT: number = 1.4986684330971931438916522669669608

  /**
   *
   *
   * @static
   * @param {Star} star1
   * @param {Star} star2
   * @return {*}
   * @memberof ByGravity
   */
  public static generageGravity(star1: Star, star2: Star): number {
    return (
      ((star1.quality * star2.quality) /
        Math.sqrt(Position.distance(star1.position, star2.position))) *
      ByGravity.GRAVITATIONAL_CONSTANT
    )
  }

  public static toGravity(star1: Star, star2: Star): void {
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
