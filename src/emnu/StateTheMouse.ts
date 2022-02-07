/**
 * NORMAL是正常状态
 * PRESS 是鼠标按下状态
 * DRAG 是鼠标拖动物体的状态
 * @export
 * @enum {number}
 */
export enum StateTheMouse {
  /**
   *正常模式
   */
  NORMAL,
  /**
   * 按下鼠标
   */
  PRESS,
  /**
   * 拖动模式
   */
  DRAG,
  /**
   * 弹力弹弓模式加速
   */
  LAUNCH,
}
