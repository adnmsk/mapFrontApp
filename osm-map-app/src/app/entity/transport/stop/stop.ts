import {Persistent} from '../persistent';
import {LocalName} from '../localname';

export class Stop {
  persistent: Persistent = new Persistent();
  number?: number;
  abbreviation?: string;
  address?: string;
  depot: boolean = false;

  constructor(data: Partial<Stop> = {}) {
    Object.assign(this, data);
    this.persistent = new Persistent(data.persistent);
  }


}
