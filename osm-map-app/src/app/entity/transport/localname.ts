export class LocalName {
  language: string = ''; // Например, 'en', 'ru'
  name: string = '';
  locale: string = '';

  constructor(data: Partial<LocalName> = {}) {
    Object.assign(this, data);
  }
}
