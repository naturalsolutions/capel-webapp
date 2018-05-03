import * as _ from 'lodash';

export class BoatModule {
  _id: string;
  name:string;
  immatriculation:string;
  createdAt: Date;
  lastSurgeryAt: Date;

  constructor(data: any) {
    this.formatData(data);
    _.assign(this, data);
  }

  patch(data: any) {
    this.formatData(data);
    _.assign(this, data);
  }

  formatData(data) {
    _.forEach(['birthdate', 'lastSurgeryAt'], key => {
      if (data[key] && _.isString(data[key])) {
        data[key] = new Date(data[key]);
      }
    });
  }
}
