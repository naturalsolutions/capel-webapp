import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BoatService {
  constructor(
    private http: HttpClient
  ) {
  }
  getBoats(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/boats')
      .toPromise();
  }
}
