import { Component, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/first';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { config } from './settings';
import { SessionActionsService } from './store/session/session-actions.service';
import { UserService } from './services/user.service';
import { MatSnackBar } from '@angular/material';
import { AppActionsService } from './store/app/app-actions.service';
import { AppModel } from './models/app.model';
import {SessionModule} from './models/session.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isConnected: any = false;
  constructor(
    private ngRedux: NgRedux<any>,
    private router: Router,
    private route: ActivatedRoute,
    private sessionActionsService: SessionActionsService,
    private appActionsService: AppActionsService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {

  }
  logOut() {
    this.sessionActionsService.close();
    this.isConnected = false;
    this.router.navigateByUrl('/login');
  }
  ngOnInit() {
    const sessionState: SessionModule = _.get(this.ngRedux.getState(), 'session');
    if (sessionState.token) {
      this.isConnected = true;
    }
  }

  /* isSessionValid(session): boolean {
    if (!_.get(session, 'token')) {
      return false;
    }
    return true;
  }

  start() {
    this.ngRedux.select('session')
      .first((session: any) => {
        console.log('start first', session);
        if (!this.isSessionValid(session)) {
          return false;
        }
        AuthInterceptorService.token = session.token;
        return true;
      })
      .subscribe((session: any) => {
        this.router.navigate(['/profile']);
        this.ngRedux.select('session')
          .subscribe((sessions: any) => {
            if (!sessions) {
              this.start();
            }
          });
      });
  } */
}
