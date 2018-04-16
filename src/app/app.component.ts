import {Component, OnInit} from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import {Router} from '@angular/router';
import 'rxjs/add/operator/first';
import {AuthInterceptorService} from './services/auth-interceptor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(
    private ngRedux: NgRedux<any>,
    private router: Router
  ) {}
  ngOnInit() {
    this.start();
  }
  isSessionValid(session): boolean {
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
  }
}
