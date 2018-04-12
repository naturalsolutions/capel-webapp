import * as _ from 'lodash';

import {SessionModule} from '../../models/session.module';
import {ISessionAction, SessionActionsService} from './session-actions.service';
import {INITIAL_STATE} from '../initial-state/initial-state.module';

export function sessionReducer(state: any = INITIAL_STATE.session, action: ISessionAction): SessionModule {

  console.log(action.type, state);
  if (_.isPlainObject(state)) {
    state = new SessionModule(state);
  }
  switch (action.type) {
    case SessionActionsService.OPEN_SESSION:
      return new SessionModule(action.data);
    case SessionActionsService.CLOSE_SESSION:
      return null;
    case SessionActionsService.PATCH_SESSION:
      state.patch(action.data);
      return new SessionModule(state.toJSON());
    default:
      return state || INITIAL_STATE.session;
  }
}
