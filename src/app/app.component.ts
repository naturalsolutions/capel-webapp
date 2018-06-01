import {Component, OnInit, ViewEncapsulation, HostBinding} from '@angular/core';
import {Observable} from 'rxjs';
import {Router, ActivatedRoute} from '@angular/router';
import {NgRedux} from '@angular-redux/store';
import {MatSnackBar} from '@angular/material';
import 'rxjs/add/operator/first';
import * as _ from 'lodash';

import {AppModel} from './models/app.model';
import {AppActionsService} from './store/app/app-actions.service';
import {AuthInterceptorService} from './services/auth-interceptor.service';
import {SessionModule} from './models/session.module';
import {UserService} from './services/user.service';
import {config} from './settings';
import {getNsPrefix} from '@angular/compiler';
import {DiveService} from './services/dive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  @HostBinding('class.nosidenav') nosidenav: boolean;
  @HostBinding('class.is-connected') isConnected: boolean;
  groupedDives: any[] = [];
  dives = [];

  constructor(private ngRedux: NgRedux<any>,
              private router: Router,
              private route: ActivatedRoute,
              private appActionsService: AppActionsService,
              private userService: UserService,
              private snackBar: MatSnackBar,
              private diveService: DiveService) {
  }

  logOut() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {

    this.diveService.added$
      .subscribe(value => {
        if (this.isConnected)
          this.getDives();
      });

    this.ngRedux.select('session')
      .subscribe((session: any) => {
        this.isConnected = _.get(session, 'token');
        if (this.isConnected)
          this.getDives();
      });

    //TODO
    this.router.events.subscribe(value => {
      this.nosidenav = ['/login', '/register'].indexOf(this.router.routerState.snapshot.url) > -1;
    });
  }

  getDives() {
    console.log('getDives');
    this.diveService.getDives().then(data => {
      this.dives = data;
      const obj: any = {};
      this.droupeDives_2();
      console.log(this.groupedDives);
    }, error => {
      console.log(error);
    });
  }

  droupeDives_1() {

    for (const dive of this.dives) {
      let obj: any = {};
      obj.dives = [];
      let exists = this.groupedDives.find((groupedDive) => {
        return dive.divingDate = groupedDive.divingDate;
      })
      if (exists)
        exists.dives.push(dive)
      else {
        obj.dive = dive;
        this.groupedDives.push(obj);
      }
    }
  }

  droupeDives_2() {

    for (let i = 0; i < this.dives.length; i++) {
      console.log(i);
      let obj: any = {};
      obj.dives = [];
      obj.dive = this.dives[i];
      let exists = true;
      while (exists == true) {
        if ((i + 1) == this.dives.length) {
          exists = false;
        } else if (this.dives[i].divingDate === this.dives[i + 1].divingDate) {
          obj.dives.push(this.dives[i + 1]);
          i++;
        }else if (this.dives[i].divingDate !== this.dives[i + 1].divingDate) {
          exists = false;
        }
      }
      this.groupedDives.push(obj);
      }
  }

  /*
  isSessionValid(session): boolean {
    if (!_.get(session, 'token')) {
      return false;
    }
    return true;
  }

  start() {
    this.ngRedux.select('session')
      .first((session: any) => {
        console.debug('start first', session);
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
