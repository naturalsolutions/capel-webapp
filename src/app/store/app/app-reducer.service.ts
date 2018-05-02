import * as _ from 'lodash';

import { IAppAction, AppActionsService } from './app-actions.service';
import { INITIAL_STATE } from '../initial-state/initial-state.module';
import { AppModel } from '../../models/app.model';

export function appReducer(state: any = INITIAL_STATE.app, action: IAppAction): AppModel {

  console.debug(action.type, state);
  if (_.isPlainObject(state)) {
    state = new AppModel(state);
  }
  switch (action.type) {
    case AppActionsService.PATCH_APP:
      state.patch(action.data);
      return new AppModel(state.toJSON());
    case AppActionsService.APP_ADD_UNIQ_MESSAGE:
      state.addUniqMessage(action.data);
      return new AppModel(state.toJSON());
    default:
      return state || INITIAL_STATE.app;
  }
}
