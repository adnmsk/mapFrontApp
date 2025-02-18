export class Point {
  y: number = 0; // Широта
  x: number = 0; // Долгота


  constructor(data: Partial<Point> = {}) {
    Object.assign(this, data);
  }
}
