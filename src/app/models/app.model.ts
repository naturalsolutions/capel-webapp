import * as _ from 'lodash';

export class AppModel {

  version: string;
  uniqMessages: any[] = [];

  constructor(data?: any) {
    if (data) {
      this.patch(data);
    }
  }

  patch(data: any) {
    _.assign(this, data);
  }

  hasUniqMessage(value: string): boolean {
    return this.uniqMessages.indexOf(value) > -1;
  }

  addUniqMessage(value: string): void {
    if (!this.hasUniqMessage(value))
      this.uniqMessages.push(value);
  }

  toJSON(): any {
    const data: any = _.toPlainObject(this);
    return data;
  }
}