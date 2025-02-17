import {LocalName} from './localname';

export class Persistent {
  id?: number; // Вместо Long используем number
  name?: string;
  description?: string;
  creator: string = ''; // @NotNull -> обязательное поле
  locales: LocalName[] = []; // Список локализованных названий
  active: boolean = true; // @NotNull -> обязательное поле

  constructor(data: Partial<Persistent> = {}) {
    Object.assign(this, data);
  }
}
