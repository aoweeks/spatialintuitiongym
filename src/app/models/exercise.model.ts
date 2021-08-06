export class Exercise {

  private name: string;
  private projection: string;

  private highScore: number;
  private scoreUnit: string;

  constructor(
    name: string,
    projection: string,
    highScore: number,
    scoreUnit: string,
  ) {
    this.name = name;
    this.projection = projection;
    this.highScore = highScore;
    this.scoreUnit = scoreUnit;
  }
}
