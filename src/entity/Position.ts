export default class Position {
  x: number
  y: number
  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  clone(): Position {
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
  static distance(p1: Position, p2: Position): number {
    return Math.sqrt(
      (p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y)
    )
  }

  static twoPointsForAngle(p1: Position, p2: Position): number {
    // 弧度
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
  }
}
