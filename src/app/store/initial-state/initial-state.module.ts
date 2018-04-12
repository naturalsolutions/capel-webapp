import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SessionModule} from '../../models/session.module';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
  export class IAppState {
    session?: SessionModule;
  };
  export const INITIAL_STATE: IAppState = {
    session: new SessionModule()
  };

