import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SessionModel} from '../../models/session.model';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
  export class IAppState {
    session?: SessionModel;
  };
  export const INITIAL_STATE: IAppState = {
    session: new SessionModel()
  };

