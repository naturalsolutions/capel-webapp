import { Injectable } from '@angular/core';
import {
    Router,
    ActivatedRouteSnapshot,
    CanActivate
  } from '@angular/router';
import { NgRedux } from '@angular-redux/store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public router: Router,
    private ngRedux: NgRedux<any>) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const appState = this.ngRedux.getState()
    const sessionState = appState.session
    if (sessionState) {
      const token = <string>sessionState.token || null
      if (!token) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }else {
      this.router.navigate(['/login']);
      return false;
    }

  }
}
