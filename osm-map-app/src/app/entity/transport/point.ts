export class Point {
  latitude: number = 0; // Широта
  longitude: number = 0; // Долгота


  constructor(data: Partial<Point> = {}) {
    Object.assign(this, data);
  }
}
