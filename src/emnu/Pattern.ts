/**
 * 状态
 * 此枚举作用是控制按键工作模式，比如现在按下shift应该快捷快件应该如何工作等
 *
 * @export
 * @enum {number}
 */
export enum Pattern {
  /**
   * 此模式可以调整星星的位置
   */
  NORMAL = 0,
  /**
   * 此模式调整显示区位置和大小的功能
   */
  ADJUSTMENT_MODE = 1,
  /**
   * 新建模式
   */
  NEW_MODEL = 2,
}
