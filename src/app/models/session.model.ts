import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModel } from './user.model';
import * as _ from 'lodash';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class SessionModel {
  seanceId: string;
  seance: UserModel;
  token: string;
  user: UserModel;
  patient: UserModel;
  isPatient: boolean;
  appVersion: string;
  constructor(data?: any) {
    if (data) {
      this.patch(data);
    }
  }
  patch(data: any) {
    _.assign(this, data);
    if (_.isPlainObject(this.user)) {
      this.user = new UserModel(this.user);
    }
  }

  toJSON(): any {
    const data: any = _.toPlainObject(this);
    return data;
  }
}
