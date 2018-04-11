import { NgModule } from '@angular/core';
import { config } from '../settings';

import { combineReducers } from 'redux';
import { createLogger } from 'redux-logger';
import { NgRedux, DevToolsExtension } from '@angular-redux/store';
import persistState from 'redux-localstorage';

import {SessionModel} from './session.model';
import {SessionActionsService} from '../store/session/session-actions.service';
import {sessionReducer} from '../store/session/session-reducer.service';



export class IAppState {
  session?: SessionModel;
}

@NgModule({
  providers: [SessionActionsService]
})
export class StoreModule {
  constructor(
    private ngRedux: NgRedux<IAppState>,
    public devTool: DevToolsExtension
  ) {
    const initialState: any = JSON.parse(localStorage.getItem(config.appName));

    const enhancers = [persistState(['session'], {
      key: config.appName
    })];

    this.ngRedux.configureStore(
      combineReducers<IAppState>({
        session: sessionReducer
      }),
      initialState || {},
      [createLogger()],
      [...enhancers, devTool.isEnabled() ? devTool.enhancer() : f => f]
    );
  }
}
