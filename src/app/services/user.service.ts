import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgRedux } from '@angular-redux/store';

import { config } from '../settings';
import { SessionActionsService } from '../store/session/session-actions.service';


@Injectable()
export class UserService {

  connected$: BehaviorSubject<boolean>

  constructor(
      private http: HttpClient,
      private ngRedux: NgRedux<any>,
      private sessionActionsService: SessionActionsService) {

    const sessionState = this.ngRedux.getState().session
    this.connected$ = <BehaviorSubject<boolean>>new BehaviorSubject(sessionState.token)

  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable().share()
  }

  login(data: any): Promise<any> {
    this.connected$.next(true)
    return this.http.post<any>(config.serverURL + '/api/users/login', data)
      .toPromise();
  }

  logout() {
    this.sessionActionsService.close();
    this.connected$.next(false)
  }

  getProfile(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/me')
      .toPromise();
  }

  post(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users', data)
      .toPromise();
  }

  private extractData(res: Response) {
    return res || {};
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getPermit(uid: number): Observable<HttpResponse<Blob>> {
    let headers = new HttpHeaders(
      {'Content-Type': 'application/pdf', 'Accept': 'application/pdf'})
    return this.http.get(`${config.serverURL}api/users/${uid}/permit.pdf`,
                         {headers, observe: 'response', responseType: 'blob'})
  }
}
