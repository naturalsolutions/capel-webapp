import { Injectable } from '@angular/core';
import {
    Router,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
    CanActivate
  } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public router: Router,
    private ngRedux: NgRedux<any>) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const appState = this.ngRedux.getState()
    const sessionState = appState.session
    // console.debug(sessionState);
    const token = <string>sessionState.token || null
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;

  }
}
