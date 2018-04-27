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
    return this.http.get<any>(config.serverURL + '/api/devies/typedives')
      .toPromise();
  }
}
