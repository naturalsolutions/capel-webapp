import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class DiveService {
  constructor(
    private http: HttpClient
  ) {
  }
  getDiveTypes(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/dives/typedives')
      .toPromise();
  }
  save(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users/1/dives', data)
      .toPromise();
  }
  getDives(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/dives')
      .toPromise();
  }
}
