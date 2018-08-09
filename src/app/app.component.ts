import {Component, OnInit, ViewEncapsulation, HostBinding, Inject} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { config } from './settings';
import {NgRedux} from '@angular-redux/store';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import 'rxjs/add/operator/first';
import * as _ from 'lodash';

import {AppActionsService} from './store/app/app-actions.service';
import {UserService} from './services/user.service';
import {DiveService} from './services/dive.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  showSidenav: boolean;
  @HostBinding('class.show-sidenav') get getShowSidenav() {
    return this.showSidenav;
  }

  @HostBinding('class.page-force-no-sidenav') pageNoSidenav: boolean;
  @HostBinding('class.is-connected') isConnected: boolean;
  @HostBinding('class.is-admin') isAdmin: boolean;
  groupedDives: any[] = [];
  dives = [];
  conf;
  constructor(private ngRedux: NgRedux<any>,
              private router: Router,
              private route: ActivatedRoute,
              private appActionsService: AppActionsService,
              private userService: UserService,
              public dialog: MatDialog,
              private snackBar: MatSnackBar,
              private diveService: DiveService) {
  }

  logOut() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.conf = config;
    this.diveService.added$
      .subscribe(value => {
        if (this.isConnected) {
          this.getDives();
          console.log('called');
        }
      });

    this.ngRedux.select('session')
      .subscribe((session: any) => {
        this.isConnected = _.get(session, 'token');
        if (this.isConnected) {
          this.isAdmin = _.get(session, 'profile').role === "admin";
          this.getDives();
          const status = _.get(session, 'profile').status;
          if ( ['deleted', 'bloqued'].indexOf(status) > -1 ) {
            alert("Une erreur technique est survenue merci de réessayer ultérieurement");
            this.logOut();
          }
        }
      });

    this.router.events.subscribe(value => {
      this.pageNoSidenav = ['/login', '/register'].indexOf(this.router.routerState.snapshot.url) > -1;
      this.showSidenav = false;
    });
  }

  getDives() {
    this.diveService.getDives().then(data => {
      this.dives = data;
      const obj: any = {};
      this.groupeDives_optimal();
    }, error => {
      console.log(error);
    });
  }

  groupeDives_naive() {
    this.groupedDives = []
    for (const dive of this.dives) {
      let obj: any = {};
      obj.dives = [];
      let exists = this.groupedDives.find((groupedDive) => {
        return dive.divingDate == groupedDive.dive.divingDate;
      })
      if (exists)
        exists.dives.push(dive)
      else {
        obj.dive = dive;
        this.groupedDives.push(obj);
      }
    }
  }

  groupeDives_optimal() {
    this.groupedDives = []
    for (let i = 0; i < this.dives.length; i++) {
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

  removeDive(dive: any) {
    let dialogRef = this.dialog.open(DiveDeleteDialog, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.diveService.delete(dive).then( data  => {
          this.dives = this.dives.filter(gpDive => {
            return gpDive.id !== dive.id;
          });
          this.groupeDives_optimal();
        }, error => {
          console.log(error);
        });
      }
    });
  }
}
@Component({
  selector: 'dive-delete-dialog',
  template: `
    <h4>Suppression !</h4>
    <mat-dialog-content>
      voulez-vous vraiment supprimer la plongée selectionnée?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button mat-dialog-close color="primary" (click)="confirm()">
        Confirmer
      </button>
      <button mat-raised-button mat-dialog-close color="warn" (click)="logout()">
        Annuller
      </button>
    </mat-dialog-actions>`
})
export class DiveDeleteDialog {

  constructor(public dialogRef: MatDialogRef<DiveDeleteDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  confirm() {
    this.dialogRef.close(true);
  }

  logout() {
    this.dialogRef.close(false);
  }
}
