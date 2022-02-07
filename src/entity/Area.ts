import Position from './Position'

export default class Area {
  /**
   *
   *
   * @private
   * @type {Position}
   */
  /**
   *
   *
   * @private
   * @type {Position}
   */
  private _startPosition!: Position
  public get startPosition(): Position {
    return this._startPosition
  }

  public set startPosition(value: Position) {
    this._startPosition = value
  }

  private _endPosition!: Position
  public get endPosition(): Position {
    return this._endPosition
  }

  public set endPosition(value: Position) {
    this._endPosition = value
  }

  constructor(startPosition: Position, endPosition: Position) {
    this.startPosition = startPosition
    this.endPosition = endPosition
  }

  clone(): Area {
    return new Area(this.startPosition.clone(), this.endPosition.clone())
  }

  isTO(position: Position): boolean {
    if (
      position.x > this.startPosition.x &&
      position.x < this.endPosition.x &&
      position.y > this.startPosition.y &&
      position.y < this.endPosition.y
    ) {
      return true
    } else {
      return false
    }
  }
}
