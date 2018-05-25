import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';
import {NgRedux} from '@angular-redux/store';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DiveService {

  added$: BehaviorSubject<any>

  constructor(
    private http: HttpClient,
    private ngRedux: NgRedux<any>
  ) {
    this.added$ = <BehaviorSubject<boolean>>new BehaviorSubject({});
  }

  getDiveTypes(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/typedives')
      .toPromise();
  }
  getDiveSites(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/divesites')
      .toPromise();
  }
  getDiveHearts(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/divehearts')
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
