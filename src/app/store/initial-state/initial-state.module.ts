import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppModel } from '../../models/app.model';
import { SessionModule } from '../../models/session.module';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class IAppState {
  app?: AppModel;
  session?: SessionModule;
}

export const INITIAL_STATE: IAppState = {
  app: new AppModel(),
  session: new SessionModule()
};

