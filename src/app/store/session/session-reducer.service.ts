import * as _ from 'lodash';

import {SessionModel} from '../../models/session.model';
import {ISessionAction, SessionActionsService} from './session-actions.service';
import {INITIAL_STATE} from '../initial-state/initial-state.module';

export function sessionReducer(state: any = INITIAL_STATE.session, action: ISessionAction): SessionModel {

  console.log(action.type, state);
  if (_.isPlainObject(state)) {
    state = new SessionModel(state);
  }
  switch (action.type) {
    case SessionActionsService.OPEN_SESSION:
      return new SessionModel(action.data);
    case SessionActionsService.CLOSE_SESSION:
      return null;
    case SessionActionsService.PATCH_SESSION:
      state.patch(action.data);
      return new SessionModel(state.toJSON());
    default:
      return state || INITIAL_STATE.session;
  }
}
