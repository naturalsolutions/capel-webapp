import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModule } from './user.module';
import * as _ from 'lodash';


export class SessionModule {

  token: string;
  user: UserModule;
  appVersion: string;

  constructor(data?: any) {
    if (data) {
      this.patch(data);
    }
  }

  patch(data: any) {
    _.assign(this, data);
    if (_.isPlainObject(this.user)) {
      this.user = new UserModule(this.user);
    }
  }

  toJSON(): any {
    const data: any = _.toPlainObject(this);
    return data;
  }

}
