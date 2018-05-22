import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';

@Injectable()
export class AuthInterceptorService  implements HttpInterceptor{

  public static token: string;

  constructor(
    private ngRedux: NgRedux<any>
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token:string = _.get(this.ngRedux.getState().session, 'token') || AuthInterceptorService.token;
    if (token && req.withCredentials !== true) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + token)
      });
      return next.handle(cloned).catch((error, caught) => {
        return this.errorHandler(error, caught);
      });
    } else {
      return next.handle(req).catch((error, caught) => {
        return this.errorHandler(error, caught);
      });
    }
  }

  errorHandler(error, caught) {
    return Observable.throw(error);
  }
}
