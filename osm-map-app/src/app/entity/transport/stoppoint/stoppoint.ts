import {Point} from '../point'
import {LocalName} from '../localname';
import {Persistent} from '../persistent';

export class StopPoint {
  persistent: Persistent = new Persistent();
  number?: number;
  bearing?: number;
  // @ts-ignore
  point: Point = new Point();

  constructor(data: Partial<StopPoint> = {}) {
    Object.assign(this, data);
    this.persistent = new Persistent(data.persistent);
    // @ts-ignore
    this.point = new Point(data.point);
  }



}
