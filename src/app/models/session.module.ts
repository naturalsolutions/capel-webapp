import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModule } from './user.module';
import * as _ from 'lodash';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class SessionModule {
  seanceId: string;
  seance: UserModule;
  token: string;
  user: UserModule;
  patient: UserModule;
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
      this.user = new UserModule(this.user);
    }
  }

  toJSON(): any {
    const data: any = _.toPlainObject(this);
    return data;
  }
}
