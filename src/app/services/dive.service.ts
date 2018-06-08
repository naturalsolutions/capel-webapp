import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';
import {NgRedux} from '@angular-redux/store';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DiveService {

  added$: BehaviorSubject<any>

  currentSite: any;
  setCurrentSite(site:any ) {
    console.log(site);
    this.currentSite = site;
  }
  getCurrentSite() {
    return this.currentSite;
  }
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
  delete(dive: any) {
    console.log(dive);
    return this.http.delete<any>(config.serverURL + '/api/users/dives/'+ dive.id, {})
      .toPromise();
  }
  get(id: any) {
    return this.http.get<any>(config.serverURL + '/api/users/dives/'+ id, {})
      .toPromise();
  }
  getCheckedPointHearts(data: any): Promise<any> {
    console.log(data);
    return this.http.post<any>(config.serverURL + '/api/users/divehearts/checkpoint', data)
      .toPromise();
  }
  saveSite(data: any): Promise<any> {

    return this.http.post<any>(config.serverURL + '/api/users/divesite/save', data)
      .toPromise();
  }
  getDives(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/dives')
      .toPromise();
  }
}
