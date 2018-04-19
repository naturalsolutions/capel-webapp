import { Injectable } from '@angular/core';
import { config } from '../settings';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Injectable()
export class UserService {
  constructor(
    private http: HttpClient
  ) {
  }

  login(data: any): Promise<any> {
    return this.http.post<any>(config.serverURL + '/api/users/login', data)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
  }
  getProfile(): Promise<any> {
    return this.http.get<any>(config.serverURL + '/api/users/me')
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);
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
}
