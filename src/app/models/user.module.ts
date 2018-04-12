import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as _ from 'lodash';
import {BoatModule} from './boat.module';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class UserModule {
  _id: string;
  firstname:string;
  lastname:string;
  email:string;
  phone:string;
  address:string;
  password: string;
  createdAt: Date;
  lastSurgeryAt: Date;
  boats: BoatModule[] = [];

  public addBoat(boat: BoatModule) {
    this.boats.push(boat);
  }

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
