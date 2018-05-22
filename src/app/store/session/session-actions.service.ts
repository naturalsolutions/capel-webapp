import { Injectable } from '@angular/core';
import { NgRedux} from '@angular-redux/store';
import {HttpClient} from '@angular/common/http';
import {AuthInterceptorService} from '../../services/auth-interceptor.service';
import {config} from '../../settings';

@Injectable()
export class SessionActionsService {

  constructor(
      private http: HttpClient,
      private ngRedux: NgRedux<any>) {}

  static OPEN_SESSION = 'OPEN_SESSION';
  public open(data: any): void {
    data.appVersion = config.appVersion;
    //AuthInterceptorService.token = data.token;
    this.ngRedux.dispatch({ type: SessionActionsService.OPEN_SESSION, data: data });
  }

  static CLOSE_SESSION = 'CLOSE_SESSION';
  public close(): void {
    AuthInterceptorService.token = null;
    this.ngRedux.dispatch({ type: SessionActionsService.CLOSE_SESSION });
  }

  static INCREMENT_DIVES = 'INCREMENT_DIVES';
  public incrementDives(): void {
    this.ngRedux.dispatch({ type: SessionActionsService.INCREMENT_DIVES });
  }

  static PATCH_SESSION = 'PATCH_SESSION';
  public patch(data: any): void {
    this.ngRedux.dispatch({ type: SessionActionsService.PATCH_SESSION, data: data });
  }
}
export interface ISessionAction {
  type: string;
  data: any;
}
