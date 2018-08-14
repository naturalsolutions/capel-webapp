import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {config} from '../settings';

@Injectable()
export class PermitService {
  constructor(private http: HttpClient){

  }
  get(): Promise<any> {
      return this.http.get<any>(config.serverURL + '/api/me/permits')
        .toPromise();
  }
}
