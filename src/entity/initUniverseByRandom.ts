import Area from "./Area";
import Position from "./Position";
import ShowScreen from "./ShowScreen";
import Spe from "./Spe";
import Star from "./Star";
import Universe from "./Universe";

export default class {
  numberTheStars: number;
  minQuality: number;
  maxQuality: number;

  minSpe: Spe;
  maxSpe: Spe;

  randomlyGeneratedArea: Area = new Area(
    new Position(-100000, -1000000),
    new Position(10000, 1000000)
  );

  constructor(
    numberTheStars: number = 10,
    minQuality: number = 100,
    maxQuality: number = 1000,
    minSpe: Spe = new Spe(-100, -100),
    maxSpe: Spe = new Spe(100, 100)
  ) {
    this.numberTheStars = numberTheStars;
    this.minQuality = minQuality;
    this.maxQuality = maxQuality;
    this.maxSpe = maxSpe;
    this.minSpe = minSpe;
  }
  run(list: Array<Star>, showScreen: ShowScreen) {
    //目标是随机在窗口显示区域内执行
    this.randomlyGeneratedArea = showScreen.area;
    // for (let i: number = 0; i < this.numberTheStars; i++) {
    //   this.randomAddStar(list, showScreen);
    // }

    const sun = new Star();
    sun.position = new Position(300, 500);
    sun.quality = 10000;
    sun.spe = new Spe(0, 0);
    sun.color = "#ff0000";
    sun.density = 1.408;
    const solarSystem = [sun];

    const earth = new Star();
    earth.position = new Position(1500, 500);
    earth.quality = 1000;
    earth.spe = new Spe(0, -400);
    earth.color = "#00ff00";
    earth.density = 5.5;

    const moon = new Star();
    moon.position = new Position(1450, 500);
    moon.quality = 100;
    moon.spe = new Spe(0, -435);
    moon.color = "#FFffff";
    moon.density = 5.5;

    list.push(moon);
    list.push(sun);
    // ``;
    list.push(earth);
  }

  randomAddStar(list: Array<Star>, showScreen: ShowScreen) {
    const star = new Star();
    star.position = new Position(
      this.getRandomArbitrary(
        this.randomlyGeneratedArea.startPosition.x,
        this.randomlyGeneratedArea.endPosition.x
      ),
      this.getRandomArbitrary(
        this.randomlyGeneratedArea.startPosition.y,
        this.randomlyGeneratedArea.endPosition.y
      )
    );
    star.quality = this.getRandomArbitrary(this.maxQuality, this.minQuality);

    // star.spe = this.getRandomArbitrarySpe();

    list.push(star);
  }
  getRandomArbitrarySpe(): Spe {
    const spe = new Spe(
      this.getRandomArbitrary(this.minSpe.x, this.maxSpe.x),
      this.getRandomArbitrary(this.minSpe.y, this.maxSpe.y)
    );
    return spe;
  }
  getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
