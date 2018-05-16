import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';
import {NgRedux} from '@angular-redux/store';

@Injectable()
export class DiveService {

  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<any>
  ) {
  }

  getDiveTypes(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/typedives')
      .toPromise();
  }
  save(data: any): Promise<any> {
    const appState = this.ngRedux.getState()
    const sessionState = appState.session
    return this.http.post<any>(config.serverURL + '/api/users/' + sessionState.profile.id + '/dives', data)
      .toPromise();
  }
  getDives(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/dives')
      .toPromise();
  }
}
