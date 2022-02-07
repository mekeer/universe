import Star from "./Star";

export default class QuadtTree {
  leftTop: QuadtTree | null = null;
  rightTop: QuadtTree | null = null;
  rightBottom: QuadtTree | null = null;
  leftBottom: QuadtTree | null = null;
  list: Star[] = [];
  bigStar: Star;
  len: number = 0;
  qualitv: number = 0;

  constructor(bigStar: Star, quality: number, len: number) {
    this.bigStar = bigStar;

    this.len = len;
    this.qualitv = quality;
  }
}
