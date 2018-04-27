import { NgModule } from '@angular/core';
import { config } from '../settings';

import { combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import { NgRedux, DevToolsExtension } from '@angular-redux/store';
import persistState from 'redux-localstorage';

import { SessionModule } from './session.module';
import { SessionActionsService } from '../store/session/session-actions.service';
import { sessionReducer } from '../store/session/session-reducer.service';
import { AppActionsService } from '../store/app/app-actions.service';
import { AppModel } from './app.model';
import { appReducer } from '../store/app/app-reducer.service';



export class IAppState {
  app?: AppModel;
  session?: SessionModule;
}

@NgModule({
  providers: [SessionActionsService, AppActionsService]
})
export class StoreModule {
  constructor(
    private ngRedux: NgRedux<IAppState>,
    public devTool: DevToolsExtension
  ) {
    const initialState: any = JSON.parse(localStorage.getItem(config.appName));

    const enhancers = [persistState(['session', 'app'], {
      key: config.appName
    })];

    this.ngRedux.configureStore(
      combineReducers<IAppState>({
        app: appReducer,
        session: sessionReducer
      }),
      initialState || {},
      [createLogger()],
      [...enhancers, devTool.isEnabled() ? devTool.enhancer() : f => f]
    );
  }
}
